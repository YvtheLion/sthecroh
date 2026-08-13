"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seed STHECROH — démarrage...');
    const departmentsData = [
        { name: 'Théologie Systématique', slug: 'theologie-systematique', desc: 'Doctrine, dogmatique et éthique chrétienne.' },
        { name: 'Langues Bibliques', slug: 'langues-bibliques', desc: 'Grec koinè, hébreu biblique et exégèse originale.' },
        { name: 'Ministère Pastoral', slug: 'ministere-pastoral', desc: 'Homilétique, counseling et direction d’église.' },
        { name: "Histoire de l'Église", slug: 'histoire-eglise', desc: 'Patristique, Réforme et christianisme contemporain.' },
    ];
    const departments = [];
    for (const d of departmentsData) {
        departments.push(await prisma.department.upsert({
            where: { slug: d.slug },
            update: {},
            create: { name: d.name, slug: d.slug, description: d.desc },
        }));
    }
    const department = departments[0];
    const programsData = [
        { name: 'Certificat en Théologie Biblique', slug: 'certificat-theologie-biblique', years: 1, level: 'Certificat' },
        { name: 'Licence en Théologie Systématique', slug: 'licence-theologie-systematique', years: 4, level: 'Licence' },
        { name: 'Licence en Ministère Pastoral', slug: 'licence-ministere-pastoral', years: 4, level: 'Licence' },
        { name: 'Master en Herméneutique Biblique', slug: 'master-hermeneutique-biblique', years: 2, level: 'Master' },
    ];
    const programs = [];
    for (const p of programsData) {
        programs.push(await prisma.program.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                durationYears: p.years,
                degreeLevel: p.level,
                departmentId: department.id,
            },
        }));
    }
    const program = programs[1];
    const teacherPasswordHash = await bcrypt.hash('Enseignant#2026', 12);
    const teachersData = [
        { email: 'samuel.diarra@sthecroh.edu', first: 'Samuel', last: 'Diarra', title: 'Directeur académique — Théologie Systématique' },
        { email: 'ruth.kabore@sthecroh.edu', first: 'Ruth', last: 'Kaboré', title: 'Professeure — Herméneutique Biblique' },
        { email: 'jb.nko@sthecroh.edu', first: 'Jean-Baptiste', last: 'Nko', title: "Professeur — Histoire de l'Église" },
        { email: 'elise.fanon@sthecroh.edu', first: 'Élise', last: 'Fanon', title: 'Professeure — Langues Bibliques' },
    ];
    const teachers = [];
    for (const t of teachersData) {
        teachers.push(await prisma.user.upsert({
            where: { email: t.email },
            update: { title: t.title },
            create: {
                email: t.email,
                passwordHash: teacherPasswordHash,
                firstName: t.first,
                lastName: t.last,
                title: t.title,
                role: 'TEACHER',
                status: 'ACTIVE',
                departmentId: department.id,
            },
        }));
    }
    const teacher = teachers[0];
    const coursesData = [
        { title: 'Théologie systématique I', slug: 'theologie-systematique-1', credits: 6, priceCents: 0 },
        { title: 'Herméneutique biblique', slug: 'hermeneutique-biblique', credits: 4, priceCents: 0 },
        { title: "Histoire de l'Église", slug: 'histoire-de-leglise', credits: 4, priceCents: 0 },
        { title: 'Grec biblique', slug: 'grec-biblique', credits: 5, priceCents: 4900 },
    ];
    const courses = [];
    for (const c of coursesData) {
        const course = await prisma.course.upsert({
            where: { slug: c.slug },
            update: {},
            create: {
                title: c.title,
                slug: c.slug,
                status: 'PUBLISHED',
                credits: c.credits,
                priceCents: c.priceCents,
                teacherId: teacher.id,
                programId: program.id,
            },
        });
        courses.push(course);
        const existingModule = await prisma.module.findFirst({ where: { courseId: course.id } });
        if (!existingModule) {
            await prisma.module.create({
                data: {
                    title: 'Module 1 — Introduction',
                    position: 0,
                    courseId: course.id,
                    lessons: {
                        create: [
                            { title: 'Leçon 1 — Présentation du cours', type: 'VIDEO', position: 0, durationMin: 18 },
                            { title: 'Support de cours.pdf', type: 'PDF', position: 1 },
                        ],
                    },
                },
            });
        }
    }
    const firstCourse = courses[0];
    const existingExam = await prisma.exam.findFirst({ where: { courseId: firstCourse.id, type: 'ASSIGNMENT' } });
    if (!existingExam) {
        await prisma.exam.create({
            data: {
                title: 'Devoir 3 — Doctrine de la grâce',
                type: 'ASSIGNMENT',
                courseId: firstCourse.id,
                maxScore: 100,
                availableTo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                instructions: 'Rédiger une dissertation de 1500 mots sur la doctrine de la grâce.',
            },
        });
    }
    const existingQuiz = await prisma.exam.findFirst({ where: { courseId: firstCourse.id, type: 'QUIZ' } });
    if (!existingQuiz) {
        await prisma.exam.create({
            data: {
                title: 'Quiz — Fondements de la théologie systématique',
                type: 'QUIZ',
                courseId: firstCourse.id,
                maxScore: 100,
                durationMin: 15,
                availableTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                instructions: 'Répondez à toutes les questions. Une seule bonne réponse par question.',
                questions: {
                    create: [
                        {
                            type: 'MCQ',
                            prompt: 'Quel terme désigne l’étude systématique des doctrines chrétiennes ?',
                            points: 34,
                            position: 0,
                            options: [
                                { id: 'a', label: 'Herméneutique' },
                                { id: 'b', label: 'Théologie systématique', correct: true },
                                { id: 'c', label: 'Patristique' },
                                { id: 'd', label: 'Exégèse' },
                            ],
                        },
                        {
                            type: 'TRUE_FALSE',
                            prompt: 'La doctrine de la Trinité affirme un seul Dieu en trois personnes.',
                            points: 33,
                            position: 1,
                            options: [
                                { id: 'true', label: 'Vrai', correct: true },
                                { id: 'false', label: 'Faux' },
                            ],
                        },
                        {
                            type: 'MCQ',
                            prompt: 'Quel concile a formulé le Symbole de Nicée-Constantinople ?',
                            points: 33,
                            position: 2,
                            options: [
                                { id: 'a', label: 'Concile de Trente' },
                                { id: 'b', label: 'Concile de Nicée (325) puis Constantinople (381)', correct: true },
                                { id: 'c', label: 'Concile de Chalcédoine' },
                                { id: 'd', label: 'Concile de Vatican II' },
                            ],
                        },
                    ],
                },
            },
        });
    }
    const studentPasswordHash = await bcrypt.hash('Etudiant#2026', 12);
    const student = await prisma.user.upsert({
        where: { email: 'emmanuel.mbeki@sthecroh.edu' },
        update: {},
        create: {
            email: 'emmanuel.mbeki@sthecroh.edu',
            passwordHash: studentPasswordHash,
            firstName: 'Emmanuel',
            lastName: 'Mbeki',
            role: 'STUDENT',
            status: 'ACTIVE',
        },
    });
    await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: courses[0].id } },
        update: {},
        create: { studentId: student.id, courseId: courses[0].id, status: 'ACTIVE', progress: 78 },
    });
    await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: courses[1].id } },
        update: {},
        create: { studentId: student.id, courseId: courses[1].id, status: 'ACTIVE', progress: 52 },
    });
    const existingCert = await prisma.certificate.findFirst({ where: { userId: student.id } });
    if (!existingCert) {
        await prisma.certificate.create({
            data: {
                userId: student.id,
                title: 'Théologie systématique I',
                courseName: courses[0].title,
                certificateNo: `STH-${new Date().getFullYear()}-0001`,
                qrToken: crypto.randomBytes(24).toString('hex'),
            },
        });
    }
    const testimonials = [
        { quote: "La plateforme m'a permis de poursuivre mes études théologiques tout en servant ma paroisse à temps plein. Le suivi de progression est très motivant.", name: 'Marc Kouadio', role: 'Étudiant, Théologie Pastorale', initials: 'MK' },
        { quote: "En tant qu'enseignante, je peux suivre mes 6 classes et corriger les devoirs depuis mon téléphone. Un vrai gain de temps administratif.", name: 'Dr. Ruth Kaboré', role: 'Enseignante, Herméneutique', initials: 'RK' },
        { quote: 'La vérification des certificats en ligne a considérablement simplifié nos processus de recrutement pastoral. Un outil sérieux et fiable.', name: 'Pasteur Noël Ateba', role: 'Directeur, Église Renaissance', initials: 'PN' },
    ];
    for (const t of testimonials) {
        const exists = await prisma.testimonial.findFirst({ where: { name: t.name } });
        if (!exists)
            await prisma.testimonial.create({ data: t });
    }
    const events = [
        { title: 'Rentrée académique 2026-2027', place: 'Campus principal, Port-au-Prince', date: new Date('2026-09-14') },
        { title: 'Conférence — Théologie et modernité', place: 'Auditorium STHECROH · en ligne', date: new Date('2026-10-02') },
        { title: 'Cérémonie de remise des diplômes', place: 'Campus principal · retransmis en direct', date: new Date('2026-11-21') },
    ];
    for (const e of events) {
        const exists = await prisma.event.findFirst({ where: { title: e.title } });
        if (!exists)
            await prisma.event.create({ data: e });
    }
    const galleryImages = [
        { label: 'Campus principal', tall: true, position: 0 },
        { label: 'Bibliothèque numérique', tall: false, position: 1 },
        { label: 'Salle de conférence', tall: false, position: 2 },
        { label: 'Cérémonie de graduation', tall: false, position: 3 },
        { label: 'Cours en présentiel', tall: true, position: 4 },
        { label: 'Chapelle du séminaire', tall: false, position: 5 },
    ];
    for (const g of galleryImages) {
        const exists = await prisma.galleryImage.findFirst({ where: { label: g.label } });
        if (!exists)
            await prisma.galleryImage.create({ data: g });
    }
    const faqItems = [
        { question: 'Les diplômes STHECROH sont-ils reconnus ?', answer: "Oui. Nos programmes sont accrédités par les instances académiques régionales, avec des équivalences reconnues dans plusieurs pays francophones.", position: 0 },
        { question: 'Puis-je étudier entièrement en ligne ?', answer: 'La majorité de nos cours sont disponibles en ligne, avec vidéos, PDF et visioconférence. Certains programmes nécessitent une présence ponctuelle sur le campus.', position: 1 },
        { question: 'Comment sont vérifiés les certificats ?', answer: 'Chaque certificat et diplôme possède un identifiant unique et un QR code renvoyant vers une page de vérification publique, sans authentification requise.', position: 2 },
        { question: 'Quels moyens de paiement acceptez-vous ?', answer: 'Carte bancaire via Stripe, PayPal, ainsi que Orange Money, MTN Mobile Money et Airtel Money selon votre pays.', position: 3 },
        { question: 'Comment faire un don au séminaire ?', answer: "La section Dons de la plateforme permet un don ponctuel ou mensuel, avec reçu automatique par e-mail et suivi de l'impact de votre contribution.", position: 4 },
    ];
    for (const f of faqItems) {
        const exists = await prisma.faqItem.findFirst({ where: { question: f.question } });
        if (!exists)
            await prisma.faqItem.create({ data: f });
    }
    const newsPosts = [
        { title: 'Ouverture des inscriptions pour la rentrée 2026-2027', excerpt: "Les inscriptions pour tous les programmes de licence et de master sont désormais ouvertes en ligne.", date: new Date('2026-07-03') },
        { title: 'STHECROH lance sa plateforme numérique complète', excerpt: "Cours en ligne, certificats vérifiables et espaces dédiés : la nouvelle plateforme LMS est en ligne.", date: new Date('2026-06-18') },
        { title: '947 diplômes délivrés depuis la création du séminaire', excerpt: "Un cap symbolique franchi lors de la dernière cérémonie de graduation du campus principal.", date: new Date('2026-06-02') },
    ];
    for (const n of newsPosts) {
        const exists = await prisma.newsPost.findFirst({ where: { title: n.title } });
        if (!exists)
            await prisma.newsPost.create({ data: n });
    }
    const milestones = [
        { year: '1998', title: 'Fondation du séminaire', text: "STHECROH ouvre ses portes à Port-au-Prince avec une première promotion de 24 étudiants en théologie pastorale.", position: 0 },
        { year: '2006', title: 'Accréditation régionale', text: "Reconnaissance par les instances académiques régionales, permettant l'équivalence des diplômes dans plusieurs pays francophones.", position: 1 },
        { year: '2014', title: 'Ouverture des départements', text: "Création des départements de Théologie Systématique, Langues Bibliques et Ministère Pastoral.", position: 2 },
        { year: '2022', title: 'Premier programme hybride', text: "Lancement des premiers cours en ligne pour accompagner les étudiants dispersés dans la diaspora.", position: 3 },
        { year: '2026', title: 'Plateforme numérique STHECROH', text: "Déploiement de la plateforme LMS complète : cours, examens, certificats vérifiables et administration unifiée.", position: 4 },
    ];
    for (const m of milestones) {
        const exists = await prisma.historyMilestone.findFirst({ where: { year: m.year, title: m.title } });
        if (!exists)
            await prisma.historyMilestone.create({ data: m });
    }
    const adminPasswordHash = await bcrypt.hash('Admin#2026', 12);
    await prisma.user.upsert({
        where: { email: 'admin@sthecroh.edu' },
        update: {},
        create: {
            email: 'admin@sthecroh.edu',
            passwordHash: adminPasswordHash,
            firstName: 'Admin',
            lastName: 'STHECROH',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
        },
    });
    const existingMessage = await prisma.message.findFirst({ where: { senderId: student.id, recipientId: teacher.id } });
    if (!existingMessage) {
        await prisma.message.create({
            data: {
                senderId: student.id,
                recipientId: teacher.id,
                body: 'Bonjour Dr. Diarra, aurai-je un délai supplémentaire pour le devoir 3 ?',
            },
        });
    }
    const libraryItems = [
        { title: 'Institution de la religion chrétienne', author: 'Jean Calvin', category: 'Théologie systématique', fileUrl: 'https://example.com/institution-chretienne.pdf', description: "Une somme théologique fondatrice de la Réforme protestante." },
        { title: "Grammaire élémentaire du grec biblique", author: 'Dr. Élise Fanon', category: 'Langues bibliques', fileUrl: 'https://example.com/grammaire-grec.pdf', description: 'Support de cours pour l’apprentissage du grec koinè.' },
        { title: "Histoire du christianisme ancien", author: 'Pr. Jean-Baptiste Nko', category: "Histoire de l'Église", fileUrl: 'https://example.com/histoire-christianisme.pdf', description: 'Des origines apostoliques aux grands conciles.' },
    ];
    for (const item of libraryItems) {
        const exists = await prisma.libraryResource.findFirst({ where: { title: item.title } });
        if (!exists)
            await prisma.libraryResource.create({ data: item });
    }
    console.log('✅ Seed terminé.');
    console.log('   Admin : admin@sthecroh.edu / Admin#2026');
    console.log('   Enseignant : samuel.diarra@sthecroh.edu / Enseignant#2026');
    console.log('   Étudiant démo : emmanuel.mbeki@sthecroh.edu / Etudiant#2026');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map