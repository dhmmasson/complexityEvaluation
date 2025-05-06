export enum Order {
  min = 0,
  max = 1,
}

export enum OrderKey {
  max_max = "max_max",
  max_min = "max_min",
  min_max = "min_max",
  min_min = "min_min",
}

function getOrderKey(order: Order, order2: Order) {
  if (order === Order.max && order2 === Order.max) {
    return OrderKey.max_max;
  } else if (order === Order.max && order2 === Order.min) {
    return OrderKey.max_min;
  }
  if (order === Order.min && order2 === Order.max) {
    return OrderKey.min_max;
  } else if (order === Order.min && order2 === Order.min) {
    return OrderKey.min_min;
  }
  throw new Error("Invalid order combination");
}
function getOrders(orderKey: OrderKey): Order[] {
  switch (orderKey) {
    case OrderKey.max_max:
      return [Order.max, Order.max];
    case OrderKey.max_min:
      return [Order.max, Order.min];
    case OrderKey.min_max:
      return [Order.min, Order.max];
    case OrderKey.min_min:
      return [Order.min, Order.min];
    default:
      throw new Error("Invalid order key");
  }
}

export enum ShapeType {
  linear = 0,
  uniform = 1,
  normal = 2,
  asymptotic = 3,
  cluster = 4,
  circular = 5,
}

export enum Length {
  short = 0,
  medium = 1,
  long = 2,
}

export enum ShapeKey {
  linear_short = 0,
  linear_medium = 1,
  linear_long = 2,
  uniform_short = 3,
  uniform_medium = 4,
  uniform_long = 5,
  normal_short = 6,
  normal_medium = 7,
  normal_long = 8,
  asymptotic_short = 9,
  asymptotic_medium = 10,
  asymptotic_long = 11,
  cluster_short = 12,
  cluster_medium = 13,
  cluster_long = 14,
  circular_short = 15,
  circular_medium = 16,
  circular_long = 17,
}

function getShapeKey(shapeType: ShapeType, length: Length): ShapeKey {
  switch (shapeType) {
    case ShapeType.linear:
      return ShapeKey.linear_short + length;
    case ShapeType.uniform:
      return ShapeKey.uniform_short + length;
    case ShapeType.normal:
      return ShapeKey.normal_short + length;
    case ShapeType.asymptotic:
      return ShapeKey.asymptotic_short + length;
    case ShapeType.cluster:
      return ShapeKey.cluster_short + length;
    case ShapeType.circular:
      return ShapeKey.circular_short + length;
    default:
      throw new Error("Invalid shape type");
  }
}
function getShapeType(shapeKey: ShapeKey): ShapeType {
  switch (shapeKey) {
    case ShapeKey.linear_short:
    case ShapeKey.linear_medium:
    case ShapeKey.linear_long:
      return ShapeType.linear;
    case ShapeKey.uniform_short:
    case ShapeKey.uniform_medium:
    case ShapeKey.uniform_long:
      return ShapeType.uniform;
    case ShapeKey.normal_short:
    case ShapeKey.normal_medium:
    case ShapeKey.normal_long:
      return ShapeType.normal;
    case ShapeKey.asymptotic_short:
    case ShapeKey.asymptotic_medium:
    case ShapeKey.asymptotic_long:
      return ShapeType.asymptotic;
    case ShapeKey.cluster_short:
    case ShapeKey.cluster_medium:
    case ShapeKey.cluster_long:
      return ShapeType.cluster;
    case ShapeKey.circular_short:
    case ShapeKey.circular_medium:
    case ShapeKey.circular_long:
      return ShapeType.circular;
  }
  throw new Error("Invalid shape key");
}
function getLength(shapeKey: ShapeKey): Length {
  switch (shapeKey) {
    case ShapeKey.linear_short:
    case ShapeKey.uniform_short:
    case ShapeKey.normal_short:
    case ShapeKey.asymptotic_short:
    case ShapeKey.cluster_short:
    case ShapeKey.circular_short:
      return Length.short;
    case ShapeKey.linear_medium:
    case ShapeKey.uniform_medium:
    case ShapeKey.normal_medium:
    case ShapeKey.asymptotic_medium:
    case ShapeKey.cluster_medium:
    case ShapeKey.circular_medium:
      return Length.medium;
    case ShapeKey.linear_long:
    case ShapeKey.uniform_long:
    case ShapeKey.normal_long:
    case ShapeKey.asymptotic_long:
    case ShapeKey.cluster_long:
    case ShapeKey.circular_long:
      return Length.long;
  }
  throw new Error("Invalid shape key");
}

function prettyPrintShapeKey(shapeKey: ShapeKey): string {
  switch (shapeKey) {
    case ShapeKey.linear_short:
      return "Ls";
    case ShapeKey.linear_medium:
      return "Lm";
    case ShapeKey.linear_long:
      return "Ll";
    case ShapeKey.uniform_short:
      return "Us";
    case ShapeKey.uniform_medium:
      return "Um";
    case ShapeKey.uniform_long:
      return "Ul";
    case ShapeKey.normal_short:
      return "Ns";
    case ShapeKey.normal_medium:
      return "Nm";
    case ShapeKey.normal_long:
      return "Nl";
    case ShapeKey.asymptotic_short:
      return "As";
    case ShapeKey.asymptotic_medium:
      return "Am";
    case ShapeKey.asymptotic_long:
      return "Al";
    case ShapeKey.cluster_short:
      return "Ks";
    case ShapeKey.cluster_medium:
      return "Km";
    case ShapeKey.cluster_long:
      return "Kl";
    case ShapeKey.circular_short:
      return "Cs";
    case ShapeKey.circular_medium:
      return "Cm";
    case ShapeKey.circular_long:
      return "Cl";
  }
}

type Configuration = {
  seed: number;
  shapes: ShapeType[];
  lengths: Length[];
  orders: Order[];
  orderKey: OrderKey;
  shapeKeys: ShapeKey[];
};

type OccurrenceMatrix = {
  [key in ShapeKey]: {
    [key in ShapeKey]: number;
  };
};

type OccurrenceMatrices = {
  [key in OrderKey]: OccurrenceMatrix;
};

function createConfigurationMatrices() {
  const keys = Object.values(ShapeKey) as number[];
  const a = [] as number[][];
  for (let A = 0; A < 18; A++) {
    a[A] = [] as number[];
    for (let B = 0; B < 18; B++) {
      a[A][B] = 0;
    }
  }

  return a;
}

function seedToShapeIndices(seed: number): [number, number] {
  return [Math.floor(seed * 18), Math.floor((seed * 18 * 18) % 18)];
}

export class ConfigurationManager {
  configurations: Map<OrderKey, number[][]>;
  constructor() {
    this.configurations = new Map<OrderKey, number[][]>();
    this.configurations.set(OrderKey.max_max, createConfigurationMatrices());
    this.configurations.set(OrderKey.max_min, createConfigurationMatrices());
    this.configurations.set(OrderKey.min_max, createConfigurationMatrices());
    this.configurations.set(OrderKey.min_min, createConfigurationMatrices());
  }

  nextConfiguration(
    seed: number,
    orderKey: OrderKey,
    previousConfigurations: Configuration[]
  ) {
    const configurationMatrix = this.configurations.get(orderKey);
    if (!configurationMatrix) {
      throw new Error("Invalid configuration");
    }
    let min = configurationMatrix[1][0];
    for (let i = 0; i < 18; i++) {
      for (let j = 0; j < 18; j++) {
        if (i !== j) {
          min = Math.min(min, configurationMatrix[i][j]);
        }
      }
    }
    let shapeIndices = [0, 0];
    do {
      seed = (seed + Math.PI) % 1; // Pi
      shapeIndices = seedToShapeIndices(seed);
    } while (
      shapeIndices[0] === shapeIndices[1] ||
      configurationMatrix[shapeIndices[0]][shapeIndices[1]] > min
    );
    return this.getConfigurationFromSeed(seed, orderKey);
  }

  getConfigurationFromSeed(seed: number, orderKey: OrderKey): Configuration {
    const shapeIndices = seedToShapeIndices(seed);
    const configuration: Configuration = {
      seed: seed,
      shapes: shapeIndices.map((seed) => getShapeType(seed)),
      lengths: shapeIndices.map((seed) => getLength(seed)),
      orders: getOrders(orderKey),
      orderKey: orderKey,
      shapeKeys: shapeIndices,
    };
    return configuration;
  }

  countConfiguration(configuration: Configuration) {
    const configurationMatrix = this.configurations.get(configuration.orderKey);
    if (!configurationMatrix) {
      throw new Error("Invalid configuration");
    }
    configurationMatrix[configuration.shapeKeys[0]][
      configuration.shapeKeys[1]
    ]++;
  }

  async savePreferences(
    userId: string,
    configuration: Configuration,
    preference: string
  ) {
    const line = `${userId},\
    ${configuration.seed},\
    ${configuration.orderKey},\
    ${prettyPrintShapeKey(configuration.shapeKeys[0])},\
    ${prettyPrintShapeKey(configuration.shapeKeys[1])},\
    ${preference}`;

    await Deno.writeFile(
      "preferences.csv",
      new TextEncoder().encode(line + "\n"),
      {
        append: true,
        create: true,
      }
    );
  }
}
