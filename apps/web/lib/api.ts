const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    // Le fetch lui-même a échoué : API injoignable (arrêtée, mauvais port, CORS bloqué)
    throw new ApiError(
      `Impossible de joindre le serveur API sur ${API_URL}. Vérifiez qu'il est démarré (pnpm start:dev dans apps/api).`,
      0,
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (body && (body.message?.message || body.message)) ||
      "Une erreur est survenue. Veuillez réessayer.";
    throw new ApiError(Array.isArray(message) ? message[0] : message, res.status);
  }

  return body as T;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  avatarUrl?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<Omit<AuthUser, 'role'> & { role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string; twoFactorCode?: string }) =>
    request<TokenPair | { requiresTwoFactor: true }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  me: (token: string) => request<AuthUser>('/users/me', { token }),
};

export interface StudentDashboardSummary {
  kpis: {
    coursesInProgress: number;
    averageProgress: number;
    assignmentsDue: number;
    certificatesCount: number;
  };
  courses: { id: string; title: string; teacher: string; progress: number; status: string }[];
  deadlines: { examId: string; type: string; label: string; tag: string; done: boolean }[];
}

export const submissionsApi = {
  submit: (token: string, examId: string, data: { fileUrl?: string; comment?: string }) =>
    request('/submissions', { method: 'POST', token, body: JSON.stringify({ examId, ...data }) }),
  grade: (token: string, submissionId: string, score: number, feedback?: string) =>
    request(`/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ score, feedback }),
    }),
};

export interface TeacherDashboardSummary {
  kpis: {
    activeCourses: number;
    studentsCount: number;
    pendingGrading: number;
    successRate: number;
  };
  courses: { id: string; title: string; studentsCount: number; examsCount: number }[];
  liveSessions: { id: string; title: string; courseTitle: string; liveUrl: string | null; liveStartsAt: string | null }[];
  pendingSubmissions: { id: string; studentName: string; examTitle: string; courseId: string; submittedAt: string }[];
}

export const dashboardApi = {
  studentSummary: (token: string) => request<StudentDashboardSummary>('/dashboard/student', { token }),
  teacherSummary: (token: string) => request<TeacherDashboardSummary>('/dashboard/teacher', { token }),
};

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  credits: number;
  priceCents: number;
  currency: string;
  teacher: { firstName: string; lastName: string };
}

export const coursesApi = {
  list: () => request<PublicCourse[]>('/courses'),
};

export const enrollmentsApi = {
  enroll: (token: string, courseId: string) =>
    request('/enrollments', { method: 'POST', token, body: JSON.stringify({ courseId }) }),
};

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  avatarUrl: string | null;
}
export interface DepartmentDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}
export interface ProgramDto {
  id: string;
  name: string;
  slug: string;
  durationYears: number;
  degreeLevel: string | null;
}
export interface PublicStats {
  studentsCount: number;
  coursesCount: number;
  certificatesCount: number;
  successRate: number;
}
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}
export interface EventItem {
  id: string;
  title: string;
  place: string;
  date: string;
}
export interface GalleryImageDto {
  id: string;
  label: string;
  imageUrl: string | null;
  tall: boolean;
}
export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
}
export interface NewsPostDto {
  id: string;
  title: string;
  excerpt: string;
  date: string;
}
export interface HistoryMilestoneDto {
  id: string;
  year: string;
  title: string;
  text: string;
}

export const contentApi = {
  teachers: () => request<Teacher[]>('/users/teachers'),
  departments: () => request<DepartmentDto[]>('/departments'),
  programs: () => request<ProgramDto[]>('/programs'),
  stats: () => request<PublicStats>('/dashboard/stats'),
  testimonials: () => request<Testimonial[]>('/testimonials'),
  events: () => request<EventItem[]>('/events'),
  gallery: () => request<GalleryImageDto[]>('/gallery'),
  faq: () => request<FaqItemDto[]>('/faq'),
  news: () => request<NewsPostDto[]>('/news'),
  history: () => request<HistoryMilestoneDto[]>('/history'),
};

export const contactApi = {
  send: (data: { name: string; email: string; subject?: string; message: string }) =>
    request('/contact-messages', { method: 'POST', body: JSON.stringify(data) }),
};

/**
 * Client générique d'administration : couvre le CRUD pour toute ressource
 * exposée par le backend (témoignages, événements, galerie, FAQ, actualités,
 * historique, départements, programmes, cours, utilisateurs, messages de contact...).
 */
export const adminApi = {
  list: <T = any>(resource: string, token: string, opts?: { all?: boolean }) =>
    request<T[]>(`/${resource}${opts?.all ? '?all=true' : ''}`, { token }),
  create: <T = any>(resource: string, token: string, data: Record<string, unknown>) =>
    request<T>(`/${resource}`, { method: 'POST', token, body: JSON.stringify(data) }),
  update: <T = any>(resource: string, token: string, id: string, data: Record<string, unknown>) =>
    request<T>(`/${resource}/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  remove: (resource: string, token: string, id: string) =>
    request(`/${resource}/${id}`, { method: 'DELETE', token }),
};

export { API_URL, request };

export interface LessonDto {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'ARTICLE' | 'LIVE_SESSION';
  videoUrl: string | null;
  pdfUrl: string | null;
  content: string | null;
  durationMin: number | null;
  liveUrl?: string | null;
  liveStartsAt?: string | null;
  completed: boolean;
}
export interface ModuleDto {
  id: string;
  title: string;
  lessons: LessonDto[];
}
export interface CourseLearnDto {
  id: string;
  title: string;
  description: string | null;
  teacher: string;
  progress: number;
  modules: ModuleDto[];
}

export const learningApi = {
  getCourse: (token: string, courseId: string) =>
    request<CourseLearnDto>(`/learning/courses/${courseId}`, { token }),
  completeLesson: (token: string, lessonId: string) =>
    request<{ progress: number }>(`/learning/lessons/${lessonId}/complete`, { method: 'PATCH', token }),
};

export interface GradeDto {
  id: string;
  score: number;
  maxScore: number;
  comment: string | null;
  createdAt: string;
  exam: { title: string; type: string; course: { title: string } };
}

export const gradesApi = {
  mine: (token: string) => request<GradeDto[]>('/grades/me', { token }),
};

export interface PaymentDto {
  id: string;
  amountCents: number;
  currency: string;
  provider: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  description: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export const paymentsApi = {
  checkout: (token: string, data: { amountCents: number; currency?: string; description: string }) =>
    request<{ checkoutUrl: string; paymentId: string }>('/payments/checkout', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  mine: (token: string) => request<PaymentDto[]>('/payments/me', { token }),
};

export interface CertificateDto {
  id: string;
  title: string;
  courseName: string | null;
  certificateNo: string;
  issuedAt: string;
  revoked: boolean;
}
export interface DiplomaDto {
  id: string;
  diplomaNo: string;
  mention: string | null;
  issuedAt: string;
  revoked: boolean;
}

export const certificatesApi = {
  mine: (token: string) => request<CertificateDto[]>('/certificates/me', { token }),
  myDiplomas: (token: string) => request<DiplomaDto[]>('/diplomas/me', { token }),
  downloadCertificatePdf: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/certificates/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = (body && (body.message?.message || body.message)) || `Téléchargement impossible (code ${res.status}).`;
      throw new ApiError(Array.isArray(message) ? message[0] : message, res.status);
    }
    return res.blob();
  },
  downloadDiplomaPdf: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/diplomas/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = (body && (body.message?.message || body.message)) || `Téléchargement impossible (code ${res.status}).`;
      throw new ApiError(Array.isArray(message) ? message[0] : message, res.status);
    }
    return res.blob();
  },
};

export interface ContactDto {
  id: string;
  firstName: string;
  lastName: string;
}
export interface ConversationDto {
  partner: ContactDto;
  lastBody: string;
  lastAt: string;
  unread: number;
}
export interface MessageDto {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const messagesApi = {
  contacts: (token: string) => request<ContactDto[]>('/messages/contacts', { token }),
  conversations: (token: string) => request<ConversationDto[]>('/messages/conversations', { token }),
  thread: (token: string, partnerId: string) => request<MessageDto[]>(`/messages/thread/${partnerId}`, { token }),
  send: (token: string, recipientId: string, body: string) =>
    request<MessageDto>('/messages', { method: 'POST', token, body: JSON.stringify({ recipientId, body }) }),
};

export interface NotificationDto {
  id: string;
  type: 'INFO' | 'PAYMENT' | 'GRADE' | 'ANNOUNCEMENT' | 'SYSTEM';
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  mine: (token: string) => request<NotificationDto[]>('/notifications/me', { token }),
  markRead: (token: string, id: string) => request(`/notifications/${id}/read`, { method: 'PATCH', token }),
};

export interface ExamQuestionDto {
  id: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'OPEN';
  prompt: string;
  points: number;
  options: { id: string; label: string }[] | null;
}
export interface ExamForStudentDto {
  id: string;
  title: string;
  type: string;
  courseTitle: string;
  durationMin: number | null;
  maxScore: number;
  instructions: string | null;
  alreadyAttempted: boolean;
  previousScore: number | null;
  questions: ExamQuestionDto[];
}
export interface ExamResultDto {
  score: number | null;
  maxScore: number;
  pendingManualGrading: boolean;
}

export const examTakingApi = {
  get: (token: string, examId: string) => request<ExamForStudentDto>(`/learning/exams/${examId}`, { token }),
  submit: (token: string, examId: string, answers: Record<string, string>) =>
    request<ExamResultDto>(`/learning/exams/${examId}/submit`, {
      method: 'POST',
      token,
      body: JSON.stringify({ answers }),
    }),
};

export interface TeacherCourseDto {
  id: string;
  title: string;
  slug: string;
  status: string;
  credits: number;
  priceCents: number;
  _count: { enrollments: number; modules: number; exams: number };
}
export interface TeacherLessonDto {
  id: string;
  title: string;
  type: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  content: string | null;
  durationMin: number | null;
  liveUrl?: string | null;
  liveStartsAt?: string | null;
}
export interface TeacherModuleDto {
  id: string;
  title: string;
  lessons: TeacherLessonDto[];
}
export interface TeacherQuestionDto {
  id: string;
  type: string;
  prompt: string;
  points: number;
  options: { id: string; label: string; correct?: boolean }[] | null;
}
export interface TeacherExamDto {
  id: string;
  title: string;
  type: string;
  maxScore: number;
  durationMin: number | null;
  questions: TeacherQuestionDto[];
}
export interface TeacherCourseDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  modules: TeacherModuleDto[];
  exams: TeacherExamDto[];
}

export const teacherCoursesApi = {
  list: (token: string) => request<TeacherCourseDto[]>('/teacher/courses', { token }),
  create: (token: string, data: { title: string; slug: string; description?: string; credits?: number; priceCents?: number }) =>
    request<TeacherCourseDto>('/teacher/courses', { method: 'POST', token, body: JSON.stringify(data) }),
  detail: (token: string, id: string) => request<TeacherCourseDetailDto>(`/teacher/courses/${id}`, { token }),
  update: (token: string, id: string, data: Record<string, unknown>) =>
    request(`/teacher/courses/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  remove: (token: string, id: string) => request(`/teacher/courses/${id}`, { method: 'DELETE', token }),

  addModule: (token: string, courseId: string, title: string) =>
    request(`/teacher/courses/${courseId}/modules`, { method: 'POST', token, body: JSON.stringify({ title }) }),
  deleteModule: (token: string, moduleId: string) => request(`/teacher/modules/${moduleId}`, { method: 'DELETE', token }),

  addLesson: (
    token: string,
    moduleId: string,
    data: { title: string; type: string; videoUrl?: string; pdfUrl?: string; content?: string; durationMin?: number; liveStartsAt?: string },
  ) => request(`/teacher/modules/${moduleId}/lessons`, { method: 'POST', token, body: JSON.stringify(data) }),
  deleteLesson: (token: string, lessonId: string) => request(`/teacher/lessons/${lessonId}`, { method: 'DELETE', token }),
  updateLesson: (token: string, lessonId: string, data: Record<string, unknown>) =>
    request(`/teacher/lessons/${lessonId}`, { method: 'PATCH', token, body: JSON.stringify(data) }),

  createExam: (
    token: string,
    courseId: string,
    data: {
      title: string;
      type: string;
      maxScore?: number;
      durationMin?: number;
      availableTo?: string;
      instructions?: string;
      questions?: { type: string; prompt: string; points: number; options?: unknown }[];
    },
  ) => request(`/teacher/courses/${courseId}/exams`, { method: 'POST', token, body: JSON.stringify(data) }),
  deleteExam: (token: string, examId: string) => request(`/teacher/exams/${examId}`, { method: 'DELETE', token }),
};

export const uploadsApi = {
  upload: async (token: string, file: File): Promise<{ url: string; resourceType: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ApiError((body && (body.message?.message || body.message)) || 'Envoi impossible.', res.status);
    }
    return res.json();
  },
};

export interface VerificationResult {
  type: 'certificate' | 'diploma';
  valid: boolean;
  record: {
    id: string;
    certificateNo?: string;
    diplomaNo?: string;
    title?: string;
    courseName?: string | null;
    mention?: string | null;
    issuedAt: string;
    revoked: boolean;
    user: { firstName: string; lastName: string };
    program?: { name: string };
  };
}

export const verificationApi = {
  verify: (token: string) => request<VerificationResult>(`/verification/${token}`),
  verifyByNumber: (no: string) => request<VerificationResult>(`/verification/by-number/${encodeURIComponent(no)}`),
};

export interface DonationCauseDto {
  id: string;
  title: string;
  description: string | null;
  goalCents: number | null;
  raisedCents: number;
}
export interface DonationImpactDto {
  totalRaisedCents: number;
  donorCount: number;
  causesFunded: number;
}

export const donationsApi = {
  causes: () => request<DonationCauseDto[]>('/donations/causes'),
  impact: () => request<DonationImpactDto>('/donations/impact'),
  checkout: (data: {
    donorName?: string;
    donorEmail?: string;
    amountCents: number;
    currency?: string;
    causeId?: string;
    frequency: 'ONE_TIME' | 'MONTHLY';
  }) => request<{ checkoutUrl: string; donationId: string }>('/donations/checkout', { method: 'POST', body: JSON.stringify(data) }),
};

export const emailVerificationApi = {
  verify: (token: string) => request<{ verified: boolean }>(`/auth/verify-email/${token}`),
};

export interface LibraryResourceDto {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  fileUrl: string;
  coverUrl: string | null;
  description: string | null;
}

export const libraryApi = {
  list: () => request<LibraryResourceDto[]>('/library'),
};

export const paypalApi = {
  paymentCheckout: (token: string, data: { amountCents: number; currency?: string; description: string }) =>
    request<{ approveUrl: string; paymentId: string }>('/payments/paypal/checkout', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  donationCheckout: (data: { donorName?: string; donorEmail?: string; amountCents: number; currency?: string; causeId?: string }) =>
    request<{ approveUrl: string; donationId: string }>('/donations/paypal/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export interface AdminPaymentDto {
  id: string;
  amountCents: number;
  currency: string;
  provider: string;
  status: string;
  description: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}
export interface AdminDonationDto {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  amountCents: number;
  currency: string;
  provider: string;
  status: string;
  frequency: string;
  createdAt: string;
}
export interface ActivityLogDto {
  id: string;
  action: string;
  metadata: unknown;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
}

export const adminOversightApi = {
  payments: (token: string) => request<AdminPaymentDto[]>('/payments', { token }),
  donations: (token: string) => request<AdminDonationDto[]>('/donations/admin/all', { token }),
  activityLogs: (token: string) => request<ActivityLogDto[]>('/activity-logs', { token }),
};

export const certificatesIssueApi = {
  issueCertificate: (token: string, data: { userId: string; title: string; courseName?: string }) =>
    request('/certificates', { method: 'POST', token, body: JSON.stringify(data) }),
  issueDiploma: (token: string, data: { userId: string; programId: string; mention?: string }) =>
    request('/diplomas', { method: 'POST', token, body: JSON.stringify(data) }),
};

export const announcementsApi = {
  create: (token: string, data: { courseId: string; title: string; body: string }) =>
    request('/announcements', { method: 'POST', token, body: JSON.stringify(data) }),
  mine: (token: string) => request<any[]>('/announcements/mine', { token }),
  forMe: (token: string) => request<any[]>('/announcements/for-me', { token }),
};

export interface SiteSettingsDto {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

export const siteSettingsApi = {
  get: () => request<SiteSettingsDto>('/site-settings'),
  update: (token: string, data: { logoUrl?: string | null; faviconUrl?: string | null }) =>
    request<SiteSettingsDto>('/site-settings', { method: 'PATCH', token, body: JSON.stringify(data) }),
};
