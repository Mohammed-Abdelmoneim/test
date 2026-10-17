export interface ProductVariant {
  id: string;
  size: string; // e.g. "Single", "Double", "King", "Medium", "Large"
  sizeAr: string; // e.g. "سرير مفرد (120×200)", "سرير مزدوج (160×200)", "سرير كينج (180×200)"
  color: string; // e.g. "Pink", "Green", "Beige"
  colorAr: string; // e.g. "وردي بودري", "أخضر ميرمية", "بيج كريمي"
  colorHex?: string; // e.g. "#F6CAD8"
  price: number; // specific price for this variant
  stock: number; // inventory count
  image?: string; // specific image for this size/color combination
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'bedsheets' | 'pouch' | string;
  collectionId: string;
  price: number; // base price e.g. 1000 EGP
  discountEnabled: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20 (percent) or 200 (EGP)
  finalPrice: number; // e.g. 800 EGP
  images: string[];
  materials: string;
  materialsAr: string;
  dimensions: string;
  dimensionsAr: string;
  careInstructions: string;
  careInstructionsAr: string;
  availability: 'in_stock' | 'preorder' | 'out_of_stock';
  sku: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  coverImage: string;
  bannerImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  productIds: string[];
  seasonYear: string; // e.g. "Spring 2026"
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  order: number;
  isVisible: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  review: string;
  rating: number;
  customerAvatar?: string;
  date: string;
  isFeatured: boolean;
  isPublished: boolean;
  city?: string;
  productPurchased?: string;
}

export interface Promotion {
  id: string;
  title: string;
  titleAr: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliesTo: 'all' | 'bedsheets' | 'pouch' | 'collection';
  targetId?: string;
  bannerText: string;
  bannerTextAr: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export type SectionType = 
  | 'hero' 
  | 'categories' 
  | 'featured_products' 
  | 'featured_collection' 
  | 'image_text' 
  | 'testimonials' 
  | 'promo_banner' 
  | 'instagram';

export interface HomePageSection {
  id: string;
  type: SectionType;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  isVisible: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  paddingY?: 'small' | 'medium' | 'large';
  content: {
    headlineAr?: string;
    subheadlineAr?: string;
    ctaTextAr?: string;
    ctaLink?: string;
    secondaryCtaTextAr?: string;
    secondaryCtaLink?: string;
    imageUrl?: string;
    badgeTextAr?: string;
    trustText1Ar?: string;
    trustText2Ar?: string;
    trustText3Ar?: string;
    showTrustMarkers?: boolean;
    floatingBadgeTitleAr?: string;
    floatingBadgeTextAr?: string;
    showFloatingCard?: boolean;
    floatingBadgeIcon?: 'heart' | 'sparkles' | 'star' | 'rose' | 'leaf' | 'gift' | string;
    floatingPosition?: 'bottom-left' | 'bottom-right' | 'center' | 'top-right' | string;
    imageAspectRatio?: '4/3' | '16/9' | '3/4' | '1/1';
    alignment?: 'center' | 'right' | 'left';
    selectedProductIds?: string[];
    displayLimit?: number;
    collectionId?: string;
    bodyTextAr?: string;
    bannerNoteAr?: string;
    buttonTextAr?: string;
    buttonLink?: string;
    instagramHandle?: string;
    instagramPosts?: { id: string; image: string; likes: number; link?: string }[];
  };
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  folder: 'products' | 'collections' | 'website' | 'testimonials' | 'other';
  uploadedAt: string;
  size?: string;
}

export interface StoreSettings {
  brandName: string;
  brandNameAr: string;
  tagline: string;
  taglineAr: string;
  
  // Header & Logo settings (Pure Image Upload from device)
  logoUrl: string; // Uploaded logo image data URL or path
  
  // Colors & Theme
  primaryColor: string; // e.g. #D82B76
  secondaryColor: string; // e.g. #5F8D69
  accentColor: string; // e.g. #FBE4ED
  backgroundColor: string; // e.g. #FDF9F6
  textColor: string; // e.g. #2D2426
  
  // WhatsApp & Contact
  whatsAppNumber: string; // e.g. "01116009563"
  whatsAppMessageTemplate: string;
  
  // Admin Security
  adminPassword: string; // Default: "cottonella2026"

  // Announcement Bar
  announcementBar: {
    enabled: boolean;
    textAr: string;
    link?: string;
    bgColor: string;
    textColor: string;
  };

  // Header Nav Links
  header: {
    navLinks: {
      id: string;
      labelAr: string;
      labelEn: string;
      path: string;
      isVisible?: boolean;
    }[];
    showSearch: boolean;
    showInstagram: boolean;
    showWhatsApp: boolean;
  };

  // Footer
  footer: {
    brandBioAr: string;
    copyrightTextAr: string;
    instagramUrl: string;
    facebookUrl: string;
  };
}
