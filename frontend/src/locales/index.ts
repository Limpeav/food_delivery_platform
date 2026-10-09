import { en, TranslationKeys } from './en';
import { km } from './km';

export type Language = 'en' | 'km';

export const locales: Record<Language, TranslationKeys> = {
  en,
  km,
};

export { en, km };
export type { TranslationKeys };

const categoryTranslationsKm: Record<string, string> = {
  'Fast Food': 'អាហាររហ័ស',
  'Khmer Food': 'ម្ហូបខ្មែរ',
  'Pizza & Italian': 'ភីហ្សា & អ៊ីតាលី',
  'Coffee & Bakery': 'កាហ្វេ & នំប៉័ង',
  'Chinese Food': 'ម្ហូបចិន',
  'Healthy Food': 'អាហារសុខភាព',
  'Japanese & Sushi': 'ម្ហូបជប៉ុន & ស៊ូស៊ី',
  'Korean & Asian Fusion': 'ម្ហូបកូរ៉េ & អាស៊ី',
  'Mexican & Street Food': 'ម៉ិកស៊ិក & អាហារតាមផ្លូវ',
  'Desserts & Ice Cream': 'បង្អែម & ការ៉េម',
  'Indian & Himalayan': 'ម្ហូបឥណ្ឌា & ហិម៉ាឡៃ',
  'Boba & Specialty Drinks': 'តែគុជ & ភេសជ្ជៈពិសេស',
  'Middle Eastern & Halal': 'មជ្ឈិមបូព៌ា & ហាឡាល់',
  'Seafood & Coastal Grill': 'គ្រឿងសមុទ្រ & អាំង',
  'Burgers': 'ប៊ឺហ្គឺ',
  'Thai Food': 'ម្ហូបថៃ',
  'Vietnamese Food': 'ម្ហូបវៀតណាម',
  'Breakfast & Brunch': 'អាហារពេលព្រឹក & ថ្ងៃត្រង់',
  'Vegetarian & Vegan': 'ម្ហូបបួស',
  'All Cuisines': 'មុខម្ហូបទាំងអស់',
  'Specialty': 'ម្ហូបពិសេស',
  'Dish': 'មុខម្ហូប',
  'General Dining': 'អាហារទូទៅ',
  'Sides': 'អាហារបន្ថែម',
  'Drinks': 'ភេសជ្ជៈ',
  'Beverages': 'ភេសជ្ជៈ',
  'Appetizers': 'អាហារសម្រន់',
  'Main Course': 'ម្ហូបចម្បង',
  'Dessert': 'បង្អែម',
  'Snacks': 'អាហារសម្រន់ស្រាលៗ',
  'Specials': 'ម្ហូបពិសេស',
};

export function localizeCategory(name?: string | null, language?: Language): string {
  if (!name) return '';
  if (language !== 'km') return name;
  return categoryTranslationsKm[name.trim()] || name;
}
