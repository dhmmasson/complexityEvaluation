import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import {
  User,
  Users,
  Gender,
  AgeRange,
  EducationLevel,
  Frequency,
  ActivityType,
  DataAnalysisTool,
  ExpertiseLevel,
} from "./users.ts";

const users = new Users();
await users.load();
// users.backup();

Deno.test("User class should initialize correctly with valid data", () => {
  const jsonData = {
    gender: Gender.male,
    age_range: AgeRange.from_25_to_39,
    education_level: EducationLevel.bachelor_degree,
    job_title: "Software Engineer",
    specialty: "Backend Development",
    data_handling_frequency: Frequency.daily,
    activity_type: [ActivityType.modeling, ActivityType.simulation],
    data_analysis_tools: [
      DataAnalysisTool.tables_spreadsheets,
      DataAnalysisTool.scatter_plots,
    ],
    expertise_level: ExpertiseLevel.expert,
  };

  const user = new User("user123", jsonData);

  assertEquals(user.user_id, "user123");
  assertEquals(user.gender, Gender.male);
  assertEquals(user.age_range, AgeRange.from_25_to_39);
  assertEquals(user.education_level, EducationLevel.bachelor_degree);
  assertEquals(user.job_title, "Software Engineer");
  assertEquals(user.specialty, "Backend Development");
  assertEquals(user.data_handling_frequency, Frequency.daily);
  assertEquals(user.activity_type, [
    ActivityType.modeling,
    ActivityType.simulation,
  ]);
  assertEquals(user.data_analysis_tools, [
    DataAnalysisTool.tables_spreadsheets,
    DataAnalysisTool.scatter_plots,
  ]);
  assertEquals(user.expertise_level, ExpertiseLevel.expert);
  assertEquals(user.created_at instanceof Date, true);
});

Deno.test("Users class should add and retrieve users correctly", () => {
  const users = new Users();

  const jsonData = {
    gender: Gender.female,
    age_range: AgeRange.from_40_to_54,
    education_level: EducationLevel.master_degree,
    job_title: "Data Scientist",
    specialty: "Machine Learning",
    data_handling_frequency: Frequency.often,
    activity_type: [ActivityType.visualization_dashboards],
    data_analysis_tools: [DataAnalysisTool.heatmaps],
    expertise_level: ExpertiseLevel.intermediate,
  };

  const user = new User("user456", jsonData);
  users.addUser(user);

  const retrievedUser = users.getUser("user456");
  assertEquals(retrievedUser?.user_id, "user456");
  assertEquals(retrievedUser?.job_title, "Data Scientist");

  const allUsers = users.getAllUsers();
  assertEquals(allUsers.length, 1);
  assertEquals(allUsers[0].user_id, "user456");
});

Deno.test("Users class should save and load data correctly", async () => {
  const users = new Users();

  const jsonData = {
    gender: Gender.other,
    age_range: AgeRange.from_55_to_69,
    education_level: EducationLevel.doctorate,
    job_title: "Researcher",
    specialty: "Physics",
    data_handling_frequency: Frequency.sometimes,
    activity_type: [ActivityType.operational_research],
    data_analysis_tools: [DataAnalysisTool.parallel_coordinate_plots],
    expertise_level: ExpertiseLevel.beginner,
  };

  const user = new User("user789", jsonData);
  users.addUser(user);

  // Save users to file
  await users.save();

  // Create a new Users instance and load data
  const newUsers = users;
  await newUsers.load();

  const loadedUser = newUsers.getUser("user789");
  assertEquals(loadedUser?.user_id, "user789");
  assertEquals(loadedUser?.job_title, "Researcher");
  users.clear();
});

Deno.test(
  "Users class should handle non-existent user retrieval gracefully",
  () => {
    const users = new Users();
    const nonExistentUser = users.getUser("nonexistent");
    assertEquals(nonExistentUser, undefined);
  }
);
Deno.test(
  "Users class should clear all users and delete the file",
  async () => {
    const users = new Users();

    const jsonData = {
      gender: Gender.male,
      age_range: AgeRange.under_25,
      education_level: EducationLevel.high_school_diploma,
      job_title: "Intern",
      specialty: "Data Entry",
      data_handling_frequency: Frequency.rarely,
      activity_type: [ActivityType.none_of_these],
      data_analysis_tools: [DataAnalysisTool.none_of_these],
      expertise_level: ExpertiseLevel.beginner,
    };

    const user = new User("user001", jsonData);
    users.addUser(user);

    // Save users to file
    await users.save();

    // Clear users and delete the file
    await users.clear();

    // Ensure users list is empty
    assertEquals(users.getAllUsers().length, 0);
  }
);

Deno.test(
  "Users class should correctly save, load, and clear multiple users",
  async () => {
    const users = new Users();

    const user1Data = {
      gender: Gender.female,
      age_range: AgeRange.from_25_to_39,
      education_level: EducationLevel.associate_degree,
      job_title: "Analyst",
      specialty: "Business Intelligence",
      data_handling_frequency: Frequency.often,
      activity_type: [ActivityType.decision_support],
      data_analysis_tools: [DataAnalysisTool.scatter_plots],
      expertise_level: ExpertiseLevel.intermediate,
    };

    const user2Data = {
      gender: Gender.other,
      age_range: AgeRange.over_70,
      education_level: EducationLevel.prefer_not_to_say,
      job_title: "Retired",
      specialty: "Consulting",
      data_handling_frequency: Frequency.never,
      activity_type: [ActivityType.none_of_these],
      data_analysis_tools: [DataAnalysisTool.none_of_these],
      expertise_level: ExpertiseLevel.beginner,
    };

    const user1 = new User("user101", user1Data);
    const user2 = new User("user102", user2Data);

    users.addUser(user1);
    users.addUser(user2);

    // Save users to file
    await users.save();

    // Create a new Users instance and load data
    const newUsers = users;
    await newUsers.load();

    // Verify loaded data
    const loadedUser1 = newUsers.getUser("user101");
    const loadedUser2 = newUsers.getUser("user102");

    assertEquals(loadedUser1?.user_id, "user101");
    assertEquals(loadedUser1?.job_title, "Analyst");
    assertEquals(loadedUser2?.user_id, "user102");
    assertEquals(loadedUser2?.job_title, "Retired");

    // Clear users and verify
    await newUsers.clear();
    assertEquals(newUsers.getAllUsers().length, 0);
  }
);
