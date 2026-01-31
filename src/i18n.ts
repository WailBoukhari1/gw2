import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Removed hardcoded 'lng' to let detector work
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    resources: {
      en: {
        translation: {
          nav: {
            dashboard: 'Market Scout',
            strategies: 'Strategies',
            timers: 'World Events',
            inventory: 'Inventory Manager',
            dailies: 'Daily Guides',
            legendary: 'Legendary Crafting',
            collections: 'Collections',
            market: 'Market Scouting',
            invest: 'Investment Strategist'
          },
          common: {
            loading: 'Fetching Data...',
            error: 'An error occurred',
            sync: 'Sync Account',
            settings: 'Settings',
            search: 'Search...',
            view_wiki: 'View Wiki',
            total: 'Total',
            action: 'Action',
            status: 'Status'
          },
          invest: {
            title: 'INTELLIGENT INVESTMENT STRATEGIST',
            subtitle: 'Convert gold into growth with AI-driven market execution.',
            set_capital: 'Set Your Capital',
            capital_desc: 'Enter the total gold you wish to allocate. Our AI will split this across the most reliable trades currently available.',
            plan_btn: 'PLAN STRATEGY',
            active_work: 'Active Work Stream',
            no_plans: 'No active investments. Head to the Planner to build your portfolio.',
            build_portfolio: 'Build Portfolio',
            status_work: 'Status of Work',
            accept: 'Accept Plan'
          },
          inventory: {
            title: 'Multiverse Storage Hub',
            subtitle: 'Cross-character inventory intelligence and liquid gold analysis.',
            nodes: 'Storage Nodes',
            empty: 'Storage container is empty',
            analysis_title: 'Global Inventory Analysis'
          },
          dailies: {
            title: 'Elite Routine Guides',
            subtitle: 'Daily high-efficiency gold farms and boss routines.',
            bosses: 'World Bosses',
            metas: 'Meta Events',
            copy_code: 'Copy Code',
            waypoint: 'Waypoint'
          }
        }
      },
      ar: {
        translation: {
          nav: {
            dashboard: 'كشاف السوق',
            strategies: 'الاستراتيجيات',
            timers: 'أحداث العالم',
            inventory: 'مدير المخزون',
            dailies: 'الأدلة اليومية',
            legendary: 'صناعة الأسطوري',
            collections: 'المجموعات',
            market: 'كشافة السوق',
            invest: 'محلل الاستثمار'
          },
          common: {
            loading: 'جاري جلب البيانات...',
            error: 'حدث خطأ ما',
            sync: 'مزامنة الحساب',
            settings: 'الإعدادات',
            search: 'بحث...',
            view_wiki: 'رؤية الويكي',
            total: 'الإجمالي',
            action: 'الإجراء',
            status: 'الحالة'
          },
          invest: {
            title: 'محلل الاستثمار الذكي',
            subtitle: 'حوّل الذهب إلى نمو باستخدام تنفيذ السوق المدعوم بالذكاء الاصطناعي.',
            set_capital: 'حدد رأس مالك',
            capital_desc: 'أدخل إجمالي الذهب الذي ترغب في تخصيصه. سيقوم الذكاء الاصطناعي بتقسيم هذا عبر أكثر التداولات موثوقية المتاحة حاليًا.',
            plan_btn: 'تخطيط الاستراتيجية',
            active_work: 'سير العمل النشط',
            no_plans: 'لا توجد استثمارات نشطة. توجه إلى المخطط لبناء محفظتك.',
            build_portfolio: 'بناء المحفظة',
            status_work: 'حالة العمل',
            accept: 'قبول الخطة'
          },
          inventory: {
            title: 'مركز التخزين المتعدد',
            subtitle: 'ذكاء المخزون عبر الشخصيات وتحليل الذهب السائل.',
            nodes: 'عقد التخزين',
            empty: 'حاوية التخزين فارغة',
            analysis_title: 'تحليل المخزون العالمي'
          },
          dailies: {
            title: 'أدلة الروتين النخبة',
            subtitle: 'مزارع الذهب اليومية عالية الكفاءة وروتين الزعماء.',
            bosses: 'زعماء العالم',
            metas: 'أحداث الميتا',
            copy_code: 'نسخ الكود',
            waypoint: 'نقطة المسار'
          }
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
