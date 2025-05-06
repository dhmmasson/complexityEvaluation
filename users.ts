import { join } from "jsr:@std/path";

const DATA_FOLDER = "./user_data";
export enum Gender {
  male = "male",
  female = "female",
  other = "other",
  prefer_not_to_say = "prefer_not_to_say",
}

export enum AgeRange {
  under_25 = "under_25",
  from_25_to_39 = "from_25_to_39",
  from_40_to_54 = "from_40_to_54",
  from_55_to_69 = "from_55_to_69",
  over_70 = "over_70",
  prefer_not_to_say = "prefer_not_to_say",
}

export enum EducationLevel {
  high_school_diploma = "high_school_diploma",
  associate_degree = "associate_degree",
  bachelor_degree = "bachelor_degree",
  master_degree = "master_degree",
  doctorate = "doctorate",
  prefer_not_to_say = "prefer_not_to_say",
}

export enum Frequency {
  never = "never",
  rarely = "rarely",
  sometimes = "sometimes",
  often = "often",
  daily = "daily",
}

export enum ActivityType {
  operational_research = "operational_research",
  decision_support = "decision_support",
  modeling = "modeling",
  simulation = "simulation",
  optimization = "optimization",
  visualization_dashboards = "visualization_dashboards",
  none_of_these = "none_of_these",
  other = "other",
}

export enum DataAnalysisTool {
  tables_spreadsheets = "tables_spreadsheets",
  scatter_plots = "scatter_plots",
  heatmaps = "heatmaps",
  parallel_coordinate_plots = "parallel_coordinate_plots",
  other_graphical_representations = "other_graphical_representations",
  dedicated_tools = "dedicated_tools",
  none_of_these = "none_of_these",
  other = "other",
}

export enum ExpertiseLevel {
  beginner = "beginner",
  intermediate = "intermediate",
  expert = "expert",
}

export class User {
  user_id: string;
  seed: number;
  gender: Gender;
  age_range: AgeRange;
  education_level: EducationLevel;
  job_title: string;
  specialty: string;
  data_handling_frequency: Frequency;
  activity_type: ActivityType[];
  data_analysis_tools: DataAnalysisTool[];
  expertise_level: ExpertiseLevel;
  created_at: Date;
  answers: string[];

  constructor(user_id: string, formData: FormData) {
    this.user_id = user_id;
    this.seed = Math.random();
    for (const [key, value] of formData.entries()) {
      if (key in this) {
        (this as any)[key] = value;
      } else {
        console.warn(`Unexpected form field: ${key}`);
      }
    }

    this.created_at = new Date();
    this.answers = [];
  }
}

export class Users {
  users: User[];
  date: Date;

  constructor() {
    this.users = [];
    this.date = new Date();
  }

  createUser(formData: FormData): User {
    const user_id = crypto.randomUUID();
    const user = new User(user_id, formData);
    this.users.push(user);
    return user;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  getUser(user_id: string): User | undefined {
    return this.users.find((user) => user.user_id === user_id);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  save() {
    // Save to a file
    const data = JSON.stringify(this.users);
    Deno.writeTextFile(
      join(DATA_FOLDER, `users_${this.date.toISOString()}.json`),
      data
    )
      .then(() => console.log("Data saved successfully"))
      .catch((err) => console.error("Error saving data:", err));
  }

  async load() {
    // read the Data folder get the latest file
    const files = [];
    for await (const dirEntry of Deno.readDir(DATA_FOLDER)) {
      if (!dirEntry.isFile) continue;
      const name = dirEntry.name;
      const date = new Date(name.split("_")[1].split(".")[0]);
      files.push({ name, date });
    }
    if (files.length === 0) {
      console.log("No data files found");
      return;
    }
    const latestFile = [...files]
      .filter((file) => file.name.startsWith("users_"))
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0].name;

    if (!latestFile) {
      console.log("No data file found");
      return;
    }

    Deno.readTextFile(join(DATA_FOLDER, latestFile))
      .then((data) => {
        this.users = JSON.parse(data);
        console.log("Data loaded successfully");
      })
      .catch((err) => console.error("Error loading data:", err));
  }
  clear() {
    this.users = [];
    Deno.remove(join(DATA_FOLDER, `users_${this.date.toISOString()}.json`))
      .then(() => console.log("Data cleared successfully"))
      .catch((err) => console.error("Error clearing data:", err));
  }
  backup() {
    const backupFileName = `users_backup_${new Date().toISOString()}.json`;
    const data = JSON.stringify(this.users);
    Deno.writeTextFile(join(DATA_FOLDER, backupFileName), data)
      .then(() => console.log(`Backup saved as ${backupFileName}`))
      .catch((err) => console.error("Error saving backup:", err));
  }
  restore(backupFileName: string) {
    Deno.readTextFile(join(DATA_FOLDER, backupFileName))
      .then((data) => {
        this.users = JSON.parse(data);
        console.log("Data restored successfully");
      })
      .catch((err) => console.error("Error restoring data:", err));
  }
}
