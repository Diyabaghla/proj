export interface Repo {
  id: string;
  name: string;
  description: string;
  team: string;
  qaLink: string;
  repoLink: string;
  websiteLink: string;
  appSettings: string; // appsettings.json content
  appSettingsDevelopment: string; // appsettings.development.json content
}
 
/** Which settings file the modal is currently showing. */
export type SettingsFileType = 'production' | 'development';
