-- LevelUp — Supabase schema (P5 teacher platform). Paste into Supabase → SQL Editor → Run. Free tier is enough for a class or a school.
-- Teachers sign in with email (magic link). Students use anonymous sign-in + class code + nickname (no student emails / passwords; COPPA-friendly).

create table if not exists public.classes (
  id          text primary key,                       -- the id inside the LUC- class code (e.g. "c1m2abc")
  name        text not null,
  teacher_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.students (
  student_id  text primary key,                       -- S.studentId from the game
  user_id     uuid not null references auth.users(id) on delete cascade,   -- the anonymous auth user on the student's device(s)
  class_id    text not null references public.classes(id) on delete cascade,
  nickname    text not null check (char_length(nickname) <= 16),
  created_at  timestamptz not null default now()
);

create table if not exists public.progress (
  student_id  text primary key references public.students(student_id) on delete cascade,
  class_code  text not null references public.classes(id) on delete cascade,
  data        jsonb not null,                          -- CLASSROOM.snapshot(); merged client-side, never overwritten blindly
  updated_at  timestamptz not null default now()
);

create table if not exists public.assignments (
  id          text primary key,
  class_code  text not null references public.classes(id) on delete cascade,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.classes     enable row level security;
alter table public.students    enable row level security;
alter table public.progress    enable row level security;
alter table public.assignments enable row level security;

-- helper: is the signed-in user the teacher of this class?
create or replace function public.is_teacher(p_class text) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from classes c where c.id = p_class and c.teacher_id = auth.uid()) $$;

-- classes: the teacher manages their own classes
create policy "teacher owns class" on public.classes for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- students: a student sees their own row; the teacher sees the class roster
create policy "student self"      on public.students for select using (user_id = auth.uid());
create policy "teacher roster"    on public.students for select using (public.is_teacher(class_id));
create policy "teacher removes"   on public.students for delete using (public.is_teacher(class_id));

-- progress: a student reads/writes only their own row; the teacher reads every row in their class
create policy "student own progress" on public.progress for all
  using (exists(select 1 from students s where s.student_id = progress.student_id and s.user_id = auth.uid()))
  with check (exists(select 1 from students s where s.student_id = progress.student_id and s.user_id = auth.uid() and s.class_id = progress.class_code));
create policy "teacher reads class progress" on public.progress for select using (public.is_teacher(class_code));

-- assignments: teacher writes; students in the class read
create policy "teacher assigns" on public.assignments for all using (public.is_teacher(class_code)) with check (public.is_teacher(class_code));
create policy "class reads assignments" on public.assignments for select
  using (exists(select 1 from students s where s.class_id = assignments.class_code and s.user_id = auth.uid()));

-- join_class: called by a student device after anonymous sign-in (CLASSROOM.ADAPTERS.supabase.joinClass)
create or replace function public.join_class(p_class_code text, p_nickname text, p_student_id text default null)
returns json language plpgsql security definer set search_path = public as $$
declare sid text;
begin
  if not exists(select 1 from classes where id = p_class_code) then raise exception 'unknown class'; end if;
  select student_id into sid from students where user_id = auth.uid() and class_id = p_class_code;
  if sid is null then
    sid := coalesce(p_student_id, 's' || substr(md5(random()::text), 1, 12));
    insert into students(student_id, user_id, class_id, nickname) values (sid, auth.uid(), p_class_code, left(p_nickname, 16));
  end if;
  return json_build_object('student_id', sid, 'class_id', p_class_code);
end $$;
grant execute on function public.join_class(text, text, text) to authenticated;
