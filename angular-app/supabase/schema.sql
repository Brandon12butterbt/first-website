-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  images_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create generated_images table
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1024,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for generated_images
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own images"
  ON generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, credits, images_generated)
  VALUES (new.id, 3, 0); -- Start with 3 free credits
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 