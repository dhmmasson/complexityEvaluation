import { ConfigurationManager, OrderKey, ShapeKey } from "./configuration.ts";

Deno.test(
  "ConfigurationManager - nextConfiguration should generate a sequence of 40 next configurations",
  () => {
    const configurationManager = new ConfigurationManager();
    let seed = 0.123453;
    const orderKey = OrderKey.max_max;
    const previousConfigurations = [];

    for (let i = 0; i < 18 * 17 * 2; i++) {
      const configuration = configurationManager.nextConfiguration(
        seed,
        orderKey,
        previousConfigurations
      );
      previousConfigurations.push(configuration);
      seed = configuration.seed;
    }
    console.table(configurationManager.configurations.get(orderKey));
  }
);

// Same but with two players
Deno.test(
  "ConfigurationManager - nextConfiguration should generate a sequence of 40 next configurations with two players",
  () => {
    const configurationManager = new ConfigurationManager();
    let seed1 = 0.123453;
    let seed2 = 0.654321;
    const orderKey = OrderKey.max_max;
    const previousConfigurations = [];
    const previousConfigurations2 = [];
    for (let i = 0; i < 40; i++) {
      const configuration1 = configurationManager.nextConfiguration(
        seed1,
        orderKey,
        previousConfigurations
      );
      const configuration2 = configurationManager.nextConfiguration(
        seed2,
        orderKey,
        previousConfigurations2
      );
      previousConfigurations.push(configuration1);
      previousConfigurations2.push(configuration2);
      seed1 = configuration1.seed;
      seed2 = configuration2.seed;
    }
    console.table(configurationManager.configurations.get(orderKey));
  }
);
