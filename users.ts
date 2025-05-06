import { join } from "jsr:@std/path";
const DATA_FOLDER = "./data";
export enum Gender {
  male,
  female,
  other,
  prefer_not_to_say,
}

export enum AgeRange {
  under_25,
  from_25_to_39,
  from_40_to_54,
  from_55_to_69,
  over_70,
  prefer_not_to_say,
}

export enum EducationLevel {
  high_school_diploma,
  associate_degree,
  bachelor_degree,
  master_degree,
  doctorate,
  prefer_not_to_say,
}

export enum Frequency {
  never,
  rarely,
  sometimes,
  often,
  daily,
}

export enum ActivityType {
  operational_research,
  decision_support,
  modeling,
  simulation,
  optimization,
  visualization_dashboards,
  none_of_these,
  other,
}

export enum DataAnalysisTool {
  tables_spreadsheets,
  scatter_plots,
  heatmaps,
  parallel_coordinate_plots,
  other_graphical_representations,
  dedicated_tools,
  none_of_these,
  other,
}

export enum ExpertiseLevel {
  beginner,
  intermediate,
  expert,
}

export class User {
  user_id: string;
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

  constructor(user_id: string, jsonData: any) {
    this.user_id = user_id;
    // jsonData is the user data from the request body that needs to be validated
    this.gender = jsonData.gender;
    this.age_range = jsonData.age_range;
    this.education_level = jsonData.education_level;
    this.job_title = jsonData.job_title;
    this.specialty = jsonData.specialty;
    this.data_handling_frequency = jsonData.data_handling_frequency;
    this.activity_type = jsonData.activity_type;
    this.data_analysis_tools = jsonData.data_analysis_tools;
    this.expertise_level = jsonData.expertise_level;
    this.created_at = new Date();
  }
}

export class Users {
  users: User[];
  date: Date;

  constructor() {
    this.users = [];
    this.date = new Date();
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

  load() {
    Deno.readTextFile(
      join(DATA_FOLDER, `users_${this.date.toISOString()}.json`)
    )
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
