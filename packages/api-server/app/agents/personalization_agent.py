from uagents import Agent, Context, Model

class DiffMessage(Model):
    diff: str

agent = Agent(name="PersonalizationAgent", port=8002)

@agent.on_event("startup")
async def on_startup(ctx: Context):
    ctx.logger.info("Personalization Agent started")
    ctx.storage.set("preferred_style", "snake_case")

@agent.on_message(DiffMessage)
async def handle_diff(ctx: Context, sender: str, msg: DiffMessage):
    style = ctx.storage.get("preferred_style")
    ctx.logger.info(f"Received diff: {msg.diff}, preferred style: {style}")

if __name__ == "__main__":
    agent.run()
