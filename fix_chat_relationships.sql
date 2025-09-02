-- Drop existing tables to recreate with proper relationships
DROP TABLE IF EXISTS message_read_status CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

-- Recreate chat_conversations table with explicit foreign key constraints
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  assessor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id),
  CONSTRAINT fk_chat_conversations_assessment_id 
    FOREIGN KEY (assessment_id) REFERENCES assessment_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_conversations_customer_id 
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_conversations_assessor_id 
    FOREIGN KEY (assessor_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Recreate chat_messages table with explicit foreign key constraints
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_chat_messages_conversation_id 
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender_id 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Recreate message_read_status table with explicit foreign key constraints
CREATE TABLE message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id),
  CONSTRAINT fk_message_read_status_message_id 
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_read_status_user_id 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_chat_conversations_assessment_id ON chat_conversations(assessment_id);
CREATE INDEX idx_chat_conversations_customer_id ON chat_conversations(customer_id);
CREATE INDEX idx_chat_conversations_assessor_id ON chat_conversations(assessor_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view conversations they are part of" ON chat_conversations
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = assessor_id
  );

CREATE POLICY "Users can insert conversations they are part of" ON chat_conversations
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR 
    auth.uid() = assessor_id
  );

CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (customer_id = auth.uid() OR assessor_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (customer_id = auth.uid() OR assessor_id = auth.uid())
    )
  );

CREATE POLICY "Users can view read status for their messages" ON message_read_status
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_messages 
      WHERE id = message_id 
      AND sender_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert read status for their messages" ON message_read_status
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Create trigger function
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages cm
    JOIN chat_conversations cc ON cm.conversation_id = cc.id
    WHERE (cc.customer_id = user_uuid OR cc.assessor_id = user_uuid)
    AND cm.sender_id != user_uuid
    AND NOT EXISTS (
      SELECT 1 FROM message_read_status mrs 
      WHERE mrs.message_id = cm.id AND mrs.user_id = user_uuid
    )
  );
END;
$$ LANGUAGE plpgsql;
