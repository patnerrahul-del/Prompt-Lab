export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'visitor' | 'user' | 'seller' | 'admin';

export type PromptCategoryType = 'IMAGE' | 'VIDEO';

export type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

export type PromptLicenseType = 'personal' | 'commercial' | 'exclusive';

export type PromptStatus = 'draft' | 'pending' | 'published' | 'archived';

export type PromptVisibility = 'private' | 'unlisted' | 'public';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PromptVariable {
  name: string;
  label?: string;
  default_value: string;
  options?: string[];
}

export interface PromptSettings {
  aspect_ratio?: string;
  resolution?: string;
  duration?: string;
  seed?: number | string;
  style_params?: string;
  camera?: string;
  lighting?: string;
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  seller_balance_inr: number;
  commission_rate: number;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: PromptCategoryType;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  slug: string;
  category: 'IMAGE' | 'VIDEO' | 'BOTH';
  copy_template: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PromptMedia {
  id: string;
  prompt_id: string;
  media_type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnail_url?: string | null;
  blur_hash?: string | null;
  width?: number | null;
  height?: number | null;
  duration_seconds?: number | null;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  category_id: string | null;
  model_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  teaser: string | null;
  negative_prompt: string | null;
  settings: PromptSettings;
  variables: PromptVariable[];
  difficulty: PromptDifficulty;
  license_type: PromptLicenseType;
  price_inr: number;
  compare_at_price_inr: number | null;
  status: PromptStatus;
  visibility: PromptVisibility;
  is_featured: boolean;
  average_rating: number;
  reviews_count: number;
  copies_count: number;
  sales_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  category?: Category;
  model?: AIModel;
  media?: PromptMedia[];
  author?: Profile;
  tags?: { id: string; name: string; slug: string }[];
  is_favorited?: boolean;
  has_purchased?: boolean;
}

export interface PromptContent {
  prompt_id: string;
  full_prompt_text: string;
  system_instructions?: string | null;
  notes?: string | null;
  updated_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  prompt_text: string;
  negative_prompt?: string | null;
  variables: PromptVariable[];
  settings: PromptSettings;
  change_summary?: string | null;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items_count?: number;
}

export interface Review {
  id: string;
  prompt_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value_inr: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  coupon_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  subtotal_inr: number;
  discount_inr: number;
  total_inr: number;
  currency: string;
  status: OrderStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  items?: {
    id: string;
    prompt_id: string;
    unit_price_inr: number;
    prompt?: Prompt;
  }[];
}

export interface Purchase {
  id: string;
  user_id: string;
  prompt_id: string;
  order_id: string | null;
  price_paid_inr: number;
  created_at: string;
  prompt?: Prompt;
}

export interface Bundle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  price_inr: number;
  compare_at_price_inr: number | null;
  is_active: boolean;
  prompts?: Prompt[];
}

export interface SiteSettings {
  commission_rate: { percentage: number };
  ENABLE_MULTI_SELLER: { enabled: boolean };
  maintenance_mode: { enabled: boolean };
  announcement?: { text: string; active: boolean };
}
