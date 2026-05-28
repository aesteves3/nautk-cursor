import React from 'react';
import { motion } from 'framer-motion';
import { fetchCourses } from '@/api/courses';
import { useQuery } from '@tanstack/react-query';
import CourseCard from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton';

const courseImages = {
  arrais: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/arrais1_qdehe4.png',
  mestre: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/mestre1_cvtnvz.png',
  capitao: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/cap1_vetiwx.png',
};

// AE-note: Previous images location
// arrais: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/2bdd34409_arrais1.png',
// mestre: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/a0d7e03b6_mestre1.png',
// capitao: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/c5b0c6a4f_cap1.png',

export default function CoursesSection() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses({ is_active: true }),
  });

  // Sort by certification level order
  const sortedCourses = [...courses].sort((a, b) => {
    const order = { arrais: 0, mestre: 1, capitao: 2 };
    return (order[a.certification_level] ?? 99) - (order[b.certification_level] ?? 99);
  });

  return (
    <section id="courses" className="py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="font-mono text-xs tracking-[0.3em] text-orange mb-4"
            >
              CARTA DE CURSOS
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="font-archivo text-3xl md:text-5xl tracking-wide text-navy"
            >
              CERTIFICAÇÕES
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
            className="font-inter text-sm text-muted-foreground max-w-md leading-relaxed"
          >
            Do primeiro comando ao domínio completo. Cada nível é uma escalada precisa na hierarquia da navegação brasileira.
          </motion.p>
        </div>

        {/* Thin instrumentation line */}
        <div className="h-px bg-chart-grey mb-16" />

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/2] w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {sortedCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                image={courseImages[course.certification_level]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}