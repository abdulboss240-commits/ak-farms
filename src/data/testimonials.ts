export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  quote: { en: string; ur: string };
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Bilal Ahmed",
    city: "Lahore",
    rating: 5,
    quote: {
      en: "Delivered exactly as shown. Healthy, well-fed, and the delivery team was very professional.",
      ur: "بالکل ویسا ہی ڈلیور ہوا جیسا دکھایا گیا تھا۔ صحت مند اور ڈلیوری ٹیم بہت پروفیشنل تھی۔",
    },
  },
  {
    id: "t2",
    name: "Sara Khan",
    city: "Karachi",
    rating: 5,
    quote: {
      en: "Saved us an entire day at the mandi. The goat arrived with all paperwork — vaccinations, weight, age. Highly recommended.",
      ur: "ہمارا منڈی کا پورا دن بچ گیا۔ بکرا تمام کاغذات کے ساتھ آیا — ویکسین، وزن، عمر۔ زبردست!",
    },
  },
  {
    id: "t3",
    name: "Imran Malik",
    city: "Islamabad",
    rating: 5,
    quote: {
      en: "Third year ordering from them. Quality is consistent and the WhatsApp support is excellent.",
      ur: "تیسرا سال ان سے آرڈر کر رہا ہوں۔ معیار ہمیشہ بہترین اور واٹس ایپ سپورٹ شاندار۔",
    },
  },
  {
    id: "t4",
    name: "Ayesha Tariq",
    city: "Faisalabad",
    rating: 5,
    quote: {
      en: "The photos are honest — what you see is what you get. Beautiful animal, smooth delivery.",
      ur: "تصاویر ایمانداری سے ہیں — جو دیکھیں وہی ملے گا۔ خوبصورت جانور، آسان ڈلیوری۔",
    },
  },
];
