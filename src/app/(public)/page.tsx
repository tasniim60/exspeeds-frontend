import { getPosts } from "@/lib/wordpress";
import HomeBlogSection from "@/components/HomeBlogSection";
import HomeCtaSection from "@/components/HomeCtaSection";
import {
  HomeHeroSection,
  HomeAboutSection,
  HomeFeaturesSection,
  HomeBlogHeader,
} from "@/components/HomeClientSections";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function Home() {
  const posts = await getPosts(6);

  return (
    <main className="min-h-screen bg-white text-[#251516]">
      {/* 1. Hero Banner Section with Integrated Track & Ship Hub */}
      <HomeHeroSection />

     
      

      {/* 3. About XSPEED Section */}
      <HomeAboutSection />

      {/* 4. Features Section */}
      <HomeFeaturesSection />

      {/* 5. Blog Section */}
      <section className="bg-white py-20 section-spacing">
        <div className="max-w-[1400px] mx-auto px-6 space-y-10">
          <HomeBlogHeader />
          <HomeBlogSection initialPosts={posts} />
        </div>
      </section>

      {/* 6. Dynamic Personalized CTA Section */}
      <HomeCtaSection />
    </main>
  );
}
