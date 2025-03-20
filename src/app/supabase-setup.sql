-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  credits INT NOT NULL DEFAULT 5,
  images_generated INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create generated_images table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for generated_images
CREATE POLICY "Users can view their own images" 
  ON public.generated_images FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" 
  ON public.generated_images FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.generated_images TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.profiles_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.generated_images_id_seq TO authenticated; 