import { config } from 'dotenv';
import { respond, createAgent } from '../agent/index.js';

// Load environment variables
config();

async function main() {
  // Option 1: Direct function call
  const res = await respond(
    'Create a simple login form with email and password, and a secondary button to learn more.'
  );
  console.log(JSON.stringify(res, null, 2));

  // Option 2: Create an agent factory with config
  // const agent = createAgent();
  // const res = await agent.respond(
  //   'Create a simple login form with email and password, and a secondary button to learn more.'
  // );
  // console.log(JSON.stringify(res, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
