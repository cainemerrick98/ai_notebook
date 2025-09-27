import json
import logging
import tornado
import openai
import os
import sys

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from dotenv import load_dotenv


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)


load_dotenv()
API_KEY = os.getenv('OPENAI_KEY')
client = openai.Client(api_key=API_KEY)

class LlmExtensionHandler(APIHandler):
    @tornado.web.authenticated
    def post(self) -> str:
        json_body = self.get_json_body()
        message = json_body.get("message")["content"]
        context = json_body.get("context")
        if context:
            cells = context["cells"]
        
        prompt = f"""
        You are an expert data scientist. Users interact with you via
        a sidebar in their jupyter lab. They will ask general python questions
        and questions specific to your code. You will be given the user message
        and in some cases also context from the notebook. Respond in a helpful 
        manner trying as best you can to answer the query.

        User query: 
        {message}

        Context:

        Cells:
        {cells}
        """
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role":"user", "content":prompt}]
            ).choices[0].message.content
        except openai.BadRequestError:
            self.finish(json.dumps({"error": f"Bad Request Error value of message was {message}"}))

        self.finish(json.dumps({"response":response}))

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /backend/get-example endpoint!"
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "backend", "get-example"), RouteHandler),
        (url_path_join(base_url, "backend", "llm"), LlmExtensionHandler)
    ]
    web_app.add_handlers(host_pattern, handlers)
