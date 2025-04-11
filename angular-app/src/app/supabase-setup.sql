-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.generated_images;
DROP TABLE IF EXISTS public.token_purchases;
DROP TABLE IF EXISTS public.token_tracker;
DROP TABLE IF EXISTS public.profiles;
DROP FUNCTION IF EXISTS public.increment_images_generated;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  credits integer default 5,
  images_generated integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create token_purchases table
CREATE TABLE IF NOT EXISTS public.token_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  price decimal(10,2) not null,
  stripe_payment_intent_id text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create token_tracker table
CREATE TABLE IF NOT EXISTS public.token_tracker (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  package_type text not null,
  unique_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create generated_images table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to increment images_generated
CREATE OR REPLACE FUNCTION public.increment_images_generated(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    images_generated = images_generated + 1,
    credits = credits - 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update token_purchases updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for profile insert
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS void
BEGIN
  INSERT INTO public.profiles (id, email, credits, images_generated, created_at)
  values (auth.uid(), auth.email(), 5, 0, timezone('utc'::text, now()))
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token_purchases updated_at
CREATE TRIGGER update_token_purchases_updated_at
  BEFORE UPDATE ON public.token_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Token purchases policies
CREATE POLICY "Users can view their own token purchases"
  ON public.token_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token purchases"
  ON public.token_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token purchases"
  ON public.token_purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- Token tracker policies
CREATE POLICY "Users can view their own token tracker"
  ON public.token_tracker FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token tracker"
  ON public.token_tracker FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own token tracker"
  ON public.token_tracker FOR DELETE
  USING (auth.uid() = user_id);

-- Generated images policies
CREATE POLICY "Users can view their own generated images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.token_purchases TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.generated_images TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.token_tracker TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_images_generated TO authenticated; 