import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '@/api/courses';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, BookOpen, Anchor, Navigation, Compass, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import EnrollmentForm from '../components/course/EnrollmentForm';

const courseImages = {
  arrais: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/arrais1_qdehe4.png',
  mestre: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/mestre1_cvtnvz.png',
  capitao: 'https://res.cloudinary.com/dqlkvkz2v/image/upload/v1778532948/cap1_vetiwx.png',
};

// AE-note: Previous images location
// arrais: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/2bdd34409_arrais1.png',
// mestre: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/a0d7e03b6_mestre1.png',
// capitao: 'https://media.base44.com/images/public/69c6ae1aa394aee53ff11055/c5b0c6a4f_cap1.png',

const levelIcons = {
  arrais: Anchor,
  mestre: Navigation,
  capitao: Compass,
};

const levelLabels = {
  arrais: 'ARRAIS AMADOR',
  mestre: 'MESTRE AMADOR',
  capitao: 'CAPITÃO AMADOR',
};

const mestreModules = [
  { name: 'Fundamentos da Navegação', aulas: 6, hours: 2, topics: ['Sistema de Coordenadas', 'Latitude/Longitude', 'Direção, Rumo', 'Rumos Verdadeiros, Magnético, da Agulha, Marcações Relativas e Polares', 'Velocidade de Superfície e Fundo', 'Calunga'] },
  { name: 'Carta Náutica e Publicações Náuticas', aulas: 7, hours: 2, topics: ['Projeções, Mercator', 'Loxodrômica, Ortodrômica', 'Título da Carta Náutica, Notas, Rosa-dos-Ventos'] },
  { name: 'Navegação Estimada e Costeira', aulas: 7, hours: 2, topics: ['Coordenadas, Distâncias e Direções na Carta Náutica', 'Navegação Estimada, Costeira, Linha de Posição (LDP)', 'Determinação de Posição na Navegação Costeira', 'Posição por Marcações'] },
  { name: 'Instrumentos Náuticos', aulas: 3, hours: 1, topics: ['Agulhas Náuticas, Agulha Magnética', 'Agulhas Giroscópica, Instrumentos para Marcações, Odômetro e Velocímetros', 'Prumo, Ecobatímetro, Anemômetro, Anemoscópio, Barômetro, Radiogoniômetro'] },
  { name: 'GPS e DGPS', aulas: 4, hours: 1.5, topics: ['Serviços, Sinais e Códigos do GPS', 'Imprecisão do GPS/DGPS', 'Interface com GPS, Datum', 'Utilização do GPS'] },
  { name: 'Estabilidade de Embarcações', aulas: 2, hours: 1, topics: ['Definições Gerais, Reserva de Flutuabilidade, Borda Livre', 'Estabilidade Lateral, Superfície Livre, Tosamento e Alquebramento'] },
  { name: 'Tábua de Marés', aulas: 1, hours: 0.5, topics: ['Marés, Tábua de Marés, Cartas de Correntes de Marés'] },
  { name: 'Navegação Radar', aulas: 3, hours: 1, topics: ['Funcionamento do Radar', 'Propagação do Sinal Radar', 'Controles, Precisão da Posição, Auxílios Radar'] },
  { name: 'Meteorologia', aulas: 5, hours: 2, topics: ['Equilíbrio Energético, Atmosfera, Pressão Atmosférica, Temperatura do Ar', 'TSM, Brisas, Isóbaras, Carta Sinótica', 'Ciclone e Anticiclone, Cavado e Crista', 'Umidade Absoluta e Umidade Relativa', 'Nuvens, Nevoeiros, Circulação Geral do Planeta', 'Frentes, Instrumentos, Ventos, Ondas, Carta Piloto', 'Metarea V, Meteoromainha, Regras Práticas'] },
  { name: 'Comunicações na Navegação Costeira', aulas: 1, hours: 0.5, topics: ['Equipamentos', 'Prioridades e Procedimentos'] },
  { name: 'EPIRB e AIS', aulas: 1, hours: 0.5, topics: ['Noções de Funcionamento'] },
  { name: 'Sobrevivência no Mar', aulas: 2, hours: 0.5, topics: ['MOB – Homem ao Mar', 'Manobra de Boutakow e Williamson', 'Salvatagem, Pirotecnia, Balsa Salva-Vidas'] },
  { name: 'Sinalização Náutica', aulas: 6, hours: 1.5, topics: ['Sinais Náuticos, Sinais Laterais, IALA B', 'Sinais Cardinais, Perigo Isolado, Águas Seguras e Especiais', 'Sinalização Fluvial e Lacustre', 'Luzes de Sinalização Náutica'] },
  { name: 'Regras de Governo, Luzes, Marcas e Sinais - RIPEAM Avançado', aulas: 13, hours: 2.5, topics: ['Definições, Vigilância, Velocidades de Segurança', 'Risco e Manobras para Evitar Abalroamento', 'Canais Estreitos, Vias de Separação', 'Ultrapassagem, Roda-a-Roda, Rumos Cruzados e Ações de Embarcações', 'Regras de Governo na Navegação Interior', 'Definições e Alcance de Luzes', 'Embarcações de Propulsão Mecânica, a Vela, Fundeadas', 'Embarcações de Reboque, Pesca e Sem Governo', 'Embarcações Encalhada e com Capacidade de Manobra Restrita', 'Embarcações Restritas Devido Calado, de Praticagem e Sinais de Perigo', 'Sinais Sonoros'] },
];

const levelDescriptions = {
  arrais: 'Habilitação para conduzir embarcações nos limites da navegação interior. Primeiro passo para quem deseja navegar com autonomia e segurança.',
  mestre: 'Habilitação para navegação costeira. Para quem busca ampliar seus horizontes e navegar além dos limites interiores com competência técnica.',
  capitao: 'A mais alta habilitação amadora. Capacita para navegação oceânica, exigindo domínio completo de navegação astronômica e meteorologia.',
};

export default function CourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const level = pathParts[pathParts.length - 1];
  const [showEnroll, setShowEnroll] = useState(false);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', level],
    queryFn: () => fetchCourses({ certification_level: level, is_active: true }),
  });

  const course = courses[0];
  const LevelIcon = levelIcons[level] || Compass;
  const image = courseImages[level];

  if (isLoading) {
    return (
      <div className="pt-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="aspect-[21/9] w-full mb-8" />
        <Skeleton className="h-12 w-96 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={image} alt={levelLabels[level]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 pb-12 max-w-[1440px] mx-auto">
          <Link
            to="/"
            className="font-mono text-xs tracking-wider text-white/60 hover:text-orange flex items-center gap-2 mb-6 transition-colors duration-300 min-h-[44px] w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> VOLTAR AO INÍCIO
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <LevelIcon className="w-6 h-6 text-orange" />
            <span className="font-mono text-xs tracking-[0.3em] text-orange">
              {levelLabels[level]}
            </span>
          </div>

          <h1 className="font-archivo text-3xl md:text-5xl lg:text-6xl tracking-wide text-white mb-4">
            {course?.title || levelLabels[level]}
          </h1>

          <p className="font-inter text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
            {course?.long_description || course?.description || levelDescriptions[level]}
          </p>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="mb-12"
            >
              <h2 className="font-archivo text-2xl tracking-wide text-navy mb-6">VISÃO GERAL</h2>
              <p className="font-inter text-base text-muted-foreground leading-relaxed mb-6">
                {course?.long_description || levelDescriptions[level]}
              </p>
              {level === 'arrais' && (
                <div className="border-l-4 border-orange pl-6 py-4">
                  <p className="font-inter text-sm text-navy font-semibold mb-4">Incluído no Curso de Arrais Amador e Motonauta:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>10hrs de vídeo-aulas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>05hrs de vídeo-aulas alternativas, com conteúdo resumido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>PDFs com pontos relevantes da matéria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>Exercícios e questões de simulados/provas anteriores</span>
                    </li>
                  </ul>
                </div>
              )}
              {level === 'mestre' && (
                <div className="border-l-4 border-orange pl-6 py-4">
                  <p className="font-inter text-sm text-navy font-semibold mb-4">Incluído no Curso de Mestre Amador:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>16hrs de vídeo-aulas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>PDFs com pontos relevantes da matéria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>Exercícios e questões de simulados/provas anteriores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>Carta náutica (semelhante a de provas)</span>
                    </li>
                  </ul>
                </div>
              )}
              {level === 'capitao' && (
                <div className="border-l-4 border-orange pl-6 py-4">
                  <p className="font-inter text-sm text-navy font-semibold mb-4">Incluído no Curso de Capitão Amador:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>48hrs de vídeo-aulas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>PDFs com pontos relevantes da matéria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>Exercícios e questões de simulados/provas anteriores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange font-bold mt-0.5">•</span>
                      <span>Rosa de manobras</span>
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Modules */}
            {(() => {
              const modules = level === 'mestre' ? mestreModules : (course?.modules || []);
              if (modules.length === 0) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
                >
                  <h2 className="font-archivo text-2xl tracking-wide text-navy mb-8">MÓDULOS DO CURSO</h2>
                  <div className="space-y-4">
                    {modules.map((mod, idx) => (
                      <div key={idx} className="border border-chart-grey p-6 hover:border-orange/30 transition-colors duration-300 ease-ship">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs tracking-wider text-orange">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-archivo text-lg text-navy">{mod.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            {mod.aulas && (
                              <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                                {mod.aulas} aula{mod.aulas > 1 ? 's' : ''}
                              </span>
                            )}
                            {mod.hours && (
                              <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {mod.hours}H
                              </span>
                            )}
                          </div>
                        </div>
                        {mod.topics && mod.topics.length > 0 && (
                          <div className="ml-10 space-y-1.5">
                            {mod.topics.map((topic, tidx) => (
                              <p key={tidx} className="font-inter text-sm text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-orange/60 flex-shrink-0" /> {topic}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="sticky top-24 border border-chart-grey p-8 space-y-6"
            >
              {(course?.price || course?.price_label) && (
                <div>
                  <p className="font-mono text-xs tracking-wider text-muted-foreground mb-1">INVESTIMENTO</p>
                  <p className="font-archivo text-3xl text-navy">
                    {course.price_label
                      ? course.price_label
                      : `R$ ${Number(course.price).toLocaleString('pt-BR')}${level === 'mestre' ? '.' : ''}`}
                  </p>
                </div>
              )}

              <div className="h-px bg-chart-grey" />

              {course?.duration_hours && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange" />
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">DURAÇÃO</p>
                    <p className="font-inter text-sm text-navy">{course.duration_label || `${course.duration_hours} horas`}</p>
                  </div>
                </div>
              )}

              {(course?.next_start_date || course?.next_start_label) && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-orange" />
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">PRÓXIMA TURMA</p>
                    <p className="font-inter text-sm text-navy">
                      {course.next_start_label || format(new Date(course.next_start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {course?.modules && (
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-orange" />
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">MÓDULOS</p>
                    <p className="font-inter text-sm text-navy">
                      {course.modules_label || `${course.modules.length} módulos`}
                    </p>
                  </div>
                </div>
              )}

              <div className="h-px bg-chart-grey" />

              <button
                onClick={() => setShowEnroll(true)}
                className="w-full font-mono text-xs tracking-[0.15em] bg-orange text-white py-4 hover:bg-orange/90 transition-all duration-500 ease-ship min-h-[44px]"
              >
                MATRICULE-SE
              </button>

              <a
                href="/#contact"
                className="block w-full text-center font-mono text-xs tracking-[0.15em] border border-navy/20 text-navy py-4 hover:border-orange hover:text-orange transition-all duration-500 ease-ship min-h-[44px]"
              >
                FALAR COM ASSESSOR
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnroll && course && (
        <EnrollmentForm course={course} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}