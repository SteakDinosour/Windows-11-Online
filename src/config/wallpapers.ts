export interface WallpaperOption {
  id: string;
  name: string;
  type: 'image' | 'gradient';
  src: string;
  thumbnail: string;
  themePreference: 'light' | 'dark';
}

export const DEFAULT_WINDOWS_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><circle cx='64' cy='64' r='64' fill='%230078D4'/><circle cx='64' cy='46' r='23' fill='%23ffffff'/><path d='M64 76 C41 76, 23 93, 23 115 C34 123, 48 128, 64 128 C80 128, 94 123, 105 115 C105 93, 87 76, 64 76 Z' fill='%23ffffff'/></svg>";

export const USER_AVATAR = DEFAULT_WINDOWS_AVATAR;

export const AVAILABLE_AVATARS = [
  DEFAULT_WINDOWS_AVATAR,
  '/src/assets/images/win11_user_avatar_new_1793365362875.jpg',
  '/src/assets/images/win11_avatar_profile_1793364228979.jpg',
];

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'bloom-dark',
    name: 'Windows Bloom (Dark)',
    type: 'image',
    src: '/src/assets/images/win11_bloom_dark_1793364227483.jpg',
    thumbnail: '/src/assets/images/win11_bloom_dark_1793364227483.jpg',
    themePreference: 'dark',
  },
  {
    id: 'bloom-light',
    name: 'Windows Bloom (Light)',
    type: 'image',
    src: '/src/assets/images/win11_bloom_light_1793364227073.jpg',
    thumbnail: '/src/assets/images/win11_bloom_light_1793364227073.jpg',
    themePreference: 'light',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Horizon',
    type: 'image',
    src: '/src/assets/images/win11_sunrise_landscape_1793364228569.jpg',
    thumbnail: '/src/assets/images/win11_sunrise_landscape_1793364228569.jpg',
    themePreference: 'dark',
  },
  {
    id: 'glow-aurora',
    name: 'Glow Aurora',
    type: 'gradient',
    src: 'radial-gradient(ellipse at 80% 20%, #1e3a8a 0%, #0f172a 45%, #020617 100%)',
    thumbnail: 'radial-gradient(ellipse at 80% 20%, #1e3a8a 0%, #0f172a 45%, #020617 100%)',
    themePreference: 'dark',
  },
  {
    id: 'mist-calm',
    name: 'Calm Mist',
    type: 'gradient',
    src: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)',
    thumbnail: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #7dd3fc 100%)',
    themePreference: 'light',
  },
];
