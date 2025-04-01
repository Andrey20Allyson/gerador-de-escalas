import uitester from "./test-development-kit/uitester";

export async function setupTester() {
  const body = await uitester.get("body");

  await body.click();

  uitester.close();
}

setupTester();
