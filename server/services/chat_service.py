import json
from typing import AsyncGenerator
from google.adk import Runner
from google.genai import types
from google.adk.sessions.sqlite_session_service import SqliteSessionService
from agent import app as agent_app

class ChatService:
    def __init__(self):
        self.session_service = SqliteSessionService(db_path="sessions.db")
        self.runner = Runner(
            app=agent_app,
            session_service=self.session_service,
            auto_create_session=True,
        )

    def execute_chat(self, user_id: str, session_id: str, message: str, content_id: str = None) -> str:
        augmented_message = message
        if content_id:
            augmented_message = f"[Focus on Campaign Content ID: {content_id}]\n{message}"

        content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=augmented_message)]
        )

        response_text = ""
        for event in self.runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        response_text += part.text

        return response_text

    async def stream_chat(self, user_id: str, session_id: str, message: str, content_id: str = None) -> AsyncGenerator[str, None]:
        augmented_message = message
        if content_id:
            augmented_message = f"[Focus on Campaign Content ID: {content_id}]\n{message}"

        content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=augmented_message)]
        )

        for event in self.runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        clean_part = part.text.replace("\r", "")
                        yield f"data: {clean_part}\n\n"

chat_service = ChatService()
