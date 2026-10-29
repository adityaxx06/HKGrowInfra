import { useState } from 'react';
import { Award, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePublicAchievements } from '@/hooks/useAchievements';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { FadeInWhenVisible, StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { imageUrl } from '@/lib/imageUrl';
import type { TeamAchievement } from '@/types/database';

function AchievementCard({ item }: { item: TeamAchievement }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photos = item.photo_paths ?? [];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-card transition-all duration-300 hover:shadow-hover">
      {/* Photo Slider */}
      <div className="relative h-64 w-full bg-navy-900 sm:h-72">
        {photos.length > 0 ? (
          <>
            <img
              src={imageUrl(photos[activePhotoIndex], 'card')}
              alt={item.title}
              className="h-full w-full object-cover transition-opacity duration-500"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`Go to photo ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        idx === activePhotoIndex ? 'w-6 bg-gold-400' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy-800 text-gold-300">
            <Award className="h-16 w-16 opacity-60" />
          </div>
        )}
        {item.achievement_date && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-medium text-gold-300 backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(item.achievement_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-navy-800">{item.member_name}</h3>
            <p className="text-xs font-medium uppercase tracking-wider text-gold-600 whitespace-pre-line">{item.position}</p>
          </div>
        </div>

        <h2 className="font-display text-xl font-medium text-navy-900">{item.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">{item.description}</p>
      </div>
    </div>
  );
}

export function AchievementsPage() {
  const { data: achievements, isLoading, error, refetch } = usePublicAchievements();

  return (
    <>
      <PageMeta
        title="Team Achievements & Milestones | HK Grow Infra Pvt Ltd"
        description="Explore the milestones, awards, and achievements of our dedicated team members at HK Grow Infra, Prayagraj."
        canonicalPath="/achievements"
      />

      {/* Hero */}
      <section className="bg-navy-900 py-24 text-white lg:py-32">
        <FadeInWhenVisible className="container-page max-w-3xl text-center">
          <p className="eyebrow mb-5 justify-center text-gold-300">Excellence &amp; Milestones</p>
          <h1 className="font-display text-4xl font-medium leading-tight text-white lg:text-5xl">
            Our Team Achievements
          </h1>
          <p className="mt-5 text-lg text-navy-200">
            Celebrating the dedication, awards, and milestones of the professionals driving HK Grow Infra forward.
          </p>
        </FadeInWhenVisible>
      </section>

      {/* Grid */}
      <section className="py-24 lg:py-28">
        <div className="container-page">
          <QueryBoundary
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            isEmpty={achievements?.length === 0}
            emptyMessage="Team achievements coming soon."
            loadingVariant="skeleton-cards"
            skeletonCount={3}
            verbose
          >
            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {achievements?.map((item) => (
                <StaggerItem key={item.id}>
                  <AchievementCard item={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </QueryBoundary>
        </div>
      </section>
    </>
  );
}
