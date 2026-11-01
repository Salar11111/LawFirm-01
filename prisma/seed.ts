import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a production database");
  }
  console.log("Seeding database...");

  // Clean existing data
  await db.notice.deleteMany();
  await db.passwordReset.deleteMany();
  await db.auditEvent.deleteMany();
  await db.rateLimitBucket.deleteMany();
  await db.message.deleteMany();
  await db.invoice.deleteMany();
  await db.document.deleteMany();
  await db.caseUpdate.deleteMany();
  await db.case.deleteMany();
  await db.appointment.deleteMany();
  await db.review.deleteMany();
  await db.contact.deleteMany();
  await db.practiceArea.deleteMany();
  await db.user.deleteMany();

  // ---------- USERS ----------
  const adminPass = await hashPassword("admin123");
  const lawyerPass = await hashPassword("lawyer123");
  const clientPass = await hashPassword("client123");

  const admin = await db.user.create({
    data: {
      email: "admin@shaheenlaw.pk",
      password: adminPass,
      name: "Barrister Imran Ahmed",
      role: "ADMIN",
      phone: "+92 21 3537 9900",
      cnic: "42101-1234567-1",
      address: "Suite 1201, Business Avenue, I.I. Chundrigar Road",
      city: "Karachi",
      bio: "Managing Partner at Shaheen Law Associates with 25+ years of experience in constitutional and corporate law.",
      specialization: "Managing Partner",
      experience: 25,
      barLicense: "SBC/KHI/1998/0421",
    },
  });

  const lawyer1 = await db.user.create({
    data: {
      email: "sarah@shaheenlaw.pk",
      password: lawyerPass,
      name: "Advocate Sarah Malik",
      role: "LAWYER",
      phone: "+92 21 3537 9901",
      cnic: "42101-2345678-2",
      address: "Suite 1202, Business Avenue, I.I. Chundrigar Road",
      city: "Karachi",
      bio: "Senior Advocate specializing in family law, divorce, custody, and Muslim Family Laws Ordinance matters.",
      specialization: "Family Law & Civil Litigation",
      experience: 12,
      barLicense: "SBC/KHI/2012/1156",
    },
  });

  const lawyer2 = await db.user.create({
    data: {
      email: "kashif@shaheenlaw.pk",
      password: lawyerPass,
      name: "Advocate Kashif Raza",
      role: "LAWYER",
      phone: "+92 21 3537 9902",
      cnic: "42101-3456789-3",
      address: "Suite 1203, Business Avenue, I.I. Chundrigar Road",
      city: "Karachi",
      bio: "Corporate lawyer with extensive experience in mergers, acquisitions, banking law, and SECP compliance.",
      specialization: "Corporate & Banking Law",
      experience: 15,
      barLicense: "SBC/KHI/2009/0890",
    },
  });

  const lawyer3 = await db.user.create({
    data: {
      email: "fatima@shaheenlaw.pk",
      password: lawyerPass,
      name: "Advocate Fatima Khan",
      role: "LAWYER",
      phone: "+92 21 3537 9903",
      cnic: "42101-4567890-4",
      address: "Suite 1204, Business Avenue, I.I. Chundrigar Road",
      city: "Karachi",
      bio: "Criminal defense attorney with a strong track record in High Court and Supreme Court appeals.",
      specialization: "Criminal Law & Constitutional Litigation",
      experience: 9,
      barLicense: "SBC/KHI/2015/2341",
    },
  });

  const client1 = await db.user.create({
    data: {
      email: "ahmed.client@email.com",
      password: clientPass,
      name: "Ahmed Hassan",
      role: "CLIENT",
      phone: "+92 300 1234567",
      cnic: "42101-9876543-5",
      address: "House 24, Block 6, PECHS",
      city: "Karachi",
    },
  });

  const client2 = await db.user.create({
    data: {
      email: "sana.client@email.com",
      password: clientPass,
      name: "Sana Tariq",
      role: "CLIENT",
      phone: "+92 301 7654321",
      cnic: "42101-8765432-6",
      address: "Flat 5B, Clifton Tower, Clifton",
      city: "Karachi",
    },
  });

  const client3 = await db.user.create({
    data: {
      email: "usman.client@email.com",
      password: clientPass,
      name: "Usman Sheikh",
      role: "CLIENT",
      phone: "+92 333 1112233",
      cnic: "42101-7654321-7",
      address: "Bungalow 12, DHA Phase 6",
      city: "Karachi",
    },
  });

  // ---------- PRACTICE AREAS ----------
  const practiceAreas = [
    {
      title: "Family Law",
      slug: "family-law",
      description: "Divorce, Khula, custody, maintenance, and inheritance disputes under Muslim Family Laws Ordinance.",
      longDescription: "Our family law practice handles sensitive matters with compassion and discretion. We represent clients in divorce (Talaq), Khula proceedings, child custody (Hizanat), maintenance (Nafqah), and inheritance (Mirath) cases. We are well-versed in the Muslim Family Laws Ordinance 1961 and the Family Courts Act 1964.",
      icon: "Users",
      features: JSON.stringify(["Divorce & Khula", "Child Custody", "Maintenance & Nafqah", "Inheritance Disputes", "Nikah Registration", "Domestic Violence"]),
    },
    {
      title: "Corporate & Commercial Law",
      slug: "corporate-law",
      description: "Company formation, mergers, acquisitions, SECP compliance, and commercial contract drafting.",
      longDescription: "We provide comprehensive corporate legal services including company incorporation, SECP filings, shareholders agreements, mergers and acquisitions, joint ventures, and regulatory compliance under the Companies Act 2017.",
      icon: "Building2",
      features: JSON.stringify(["Company Incorporation", "SECP Compliance", "Mergers & Acquisitions", "Shareholder Agreements", "Commercial Contracts", "Joint Ventures"]),
    },
    {
      title: "Criminal Defense",
      slug: "criminal-law",
      description: "Defense in FIRs, bail applications, trials, and appeals across District, High, and Supreme Courts.",
      longDescription: "Our criminal defense team represents clients at every stage — from pre-arrest bail to Supreme Court appeals. We handle cases under the Pakistan Penal Code, Criminal Procedure Code, and special statutes including NAB ordinances and anti-terrorism laws.",
      icon: "Gavel",
      features: JSON.stringify(["Bail Applications", "Trial Defense", "High Court Appeals", "Supreme Court Appeals", "FIR Quashing", "White Collar Crime"]),
    },
    {
      title: "Property & Real Estate",
      slug: "property-law",
      description: "Property transfers, title disputes, tenancy matters, and real estate transaction documentation.",
      longDescription: "We handle all property and real estate matters including sale and purchase agreements, title verification, mutation matters, tenancy disputes, and recovery of possession under the Specific Relief Act.",
      icon: "Home",
      features: JSON.stringify(["Property Transfers", "Title Disputes", "Tenancy Matters", "Mutation Cases", "Real Estate Documentation", "Possession Recovery"]),
    },
    {
      title: "Banking & Finance",
      slug: "banking-law",
      description: "Banking litigation, loan recovery, banking court representation, and financial regulatory matters.",
      longDescription: "We represent banks and borrowers in recovery suits under the Banking Courts Ordinance, deal with SBP regulations, loan restructuring, and enforcement of financial instruments under the Negotiable Instruments Act.",
      icon: "Landmark",
      features: JSON.stringify(["Recovery Suits", "Banking Court Defense", "Loan Restructuring", "SBP Compliance", "Cheque Dishonor Cases", "Foreclosure"]),
    },
    {
      title: "Constitutional Law",
      slug: "constitutional-law",
      description: "Writ petitions, fundamental rights enforcement, and constitutional interpretation in High Courts.",
      longDescription: "Our constitutional practice includes filing writ petitions under Article 199 of the Constitution, enforcement of fundamental rights, challenging administrative actions, and Supreme Court jurisdiction under Article 184(3).",
      icon: "Scale",
      features: JSON.stringify(["Writ Petitions", "Fundamental Rights", "Administrative Law", "Public Interest Litigation", "Constitutional Interpretation", "Service Matters"]),
    },
    {
      title: "Taxation Law",
      slug: "tax-law",
      description: "Income tax, sales tax, customs disputes, and representation before FBR and tax tribunals.",
      longDescription: "We provide tax litigation and advisory services covering income tax, sales tax, federal excise, and customs matters. We represent clients before the FBR, Appellate Tribunal Inland Revenue, and High Courts.",
      icon: "Receipt",
      features: JSON.stringify(["Income Tax Disputes", "Sales Tax Matters", "FBR Representation", "Tax Tribunal Appeals", "Customs Litigation", "Tax Planning"]),
    },
    {
      title: "Cyber & IT Law",
      slug: "cyber-law",
      description: "Cybercrime defense under PECA, data protection advisory, and digital rights matters.",
      longDescription: "We handle cases under the Prevention of Electronic Crimes Act (PECA) 2016, including cybercrime defense, online defamation, data protection compliance, e-commerce disputes, and digital intellectual property matters.",
      icon: "Shield",
      features: JSON.stringify(["PECA Defense", "Data Protection", "Online Defamation", "E-Commerce Disputes", "Digital IP", "Cyber Forensics"]),
    },
  ];

  for (const pa of practiceAreas) {
    await db.practiceArea.create({ data: pa });
  }

  // ---------- CASES ----------
  const now = new Date();
  const case1 = await db.case.create({
    data: {
      caseNumber: "SLA-2024-001",
      title: "Khula Petition — Sana Tariq vs. husband",
      description: "Petition for dissolution of marriage under Section 2 of the Muslim Family Laws Ordinance on grounds of cruelty and non-maintenance.",
      practiceArea: "Family Law",
      court: "Family Court-III, District South, Karachi",
      status: "HEARING",
      priority: "HIGH",
      filedDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      nextHearing: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8),
      clientId: client2.id,
      lawyerId: lawyer1.id,
    },
  });

  const case2 = await db.case.create({
    data: {
      caseNumber: "SLA-2024-002",
      title: "Shareholder Dispute — Sheikh Industries Ltd.",
      description: "Representation of minority shareholder in oppression and mismanagement petition before the SECP and Sindh High Court.",
      practiceArea: "Corporate & Commercial Law",
      court: "Sindh High Court, Karachi",
      status: "ACTIVE",
      priority: "URGENT",
      filedDate: new Date(now.getFullYear(), now.getMonth() - 4, 22),
      nextHearing: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15),
      clientId: client3.id,
      lawyerId: lawyer2.id,
    },
  });

  const case3 = await db.case.create({
    data: {
      caseNumber: "SLA-2024-003",
      title: "Bail Application — State vs. Ahmed Hassan",
      description: "Pre-arrest bail application under Section 498 Cr.P.C in a falsely-implicated FIR under Section 420 PPC.",
      practiceArea: "Criminal Defense",
      court: "District & Sessions Court, Karachi South",
      status: "WON",
      priority: "URGENT",
      filedDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      closedDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      clientId: client1.id,
      lawyerId: lawyer3.id,
    },
  });

  const case4 = await db.case.create({
    data: {
      caseNumber: "SLA-2024-004",
      title: "Property Title Suit — DHA Plot Dispute",
      description: "Suit for declaration of title and perpetual injunction regarding a 500 sq.yd plot in DHA Phase 6.",
      practiceArea: "Property & Real Estate",
      court: "Senior Civil Judge Court, Karachi",
      status: "ACTIVE",
      priority: "MEDIUM",
      filedDate: new Date(now.getFullYear(), now.getMonth() - 6, 12),
      nextHearing: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      clientId: client3.id,
      lawyerId: lawyer1.id,
    },
  });

  const case5 = await db.case.create({
    data: {
      caseNumber: "SLA-2024-005",
      title: "Bank Recovery Suit Defense — HBL vs. Ahmed Hassan",
      description: "Defense in a recovery suit of PKR 4.5 crore before Banking Court-I, with plea of time-barred debt.",
      practiceArea: "Banking & Finance",
      court: "Banking Court-I, Karachi",
      status: "HEARING",
      priority: "HIGH",
      filedDate: new Date(now.getFullYear(), now.getMonth() - 3, 18),
      nextHearing: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 11),
      clientId: client1.id,
      lawyerId: lawyer2.id,
    },
  });

  // ---------- CASE UPDATES ----------
  await db.caseUpdate.createMany({
    data: [
      {
        caseId: case1.id,
        title: "Petition Filed",
        description: "Khula petition filed along with affidavit and maintenance record.",
        updateType: "FILING",
        createdBy: lawyer1.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      },
      {
        caseId: case1.id,
        title: "First Hearing — Notice Issued",
        description: "Court issued notice to respondent for next date. Mediation attempt ordered.",
        updateType: "HEARING",
        createdBy: lawyer1.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      },
      {
        caseId: case1.id,
        title: "Mediation Report Submitted",
        description: "Mediation failed. Court fixed next hearing for respondent's evidence.",
        updateType: "NOTE",
        createdBy: lawyer1.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      },
      {
        caseId: case2.id,
        title: "Petition Admitted",
        description: "SHC admitted the petition and issued notices to respondents for filing replies.",
        updateType: "FILING",
        createdBy: lawyer2.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 22),
      },
      {
        caseId: case2.id,
        title: "Interim Order — Financial Records",
        description: "Court directed respondents to produce audited financial statements of last 3 years.",
        updateType: "RULING",
        createdBy: lawyer2.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 9),
      },
      {
        caseId: case3.id,
        title: "Bail Granted",
        description: "Pre-arrest bail granted with surety bonds of PKR 5,00,000/- each.",
        updateType: "RULING",
        createdBy: lawyer3.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      },
      {
        caseId: case5.id,
        title: "Written Statement Filed",
        description: "Filed written statement pleading limitation and absence of cause of action.",
        updateType: "FILING",
        createdBy: lawyer2.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 30),
      },
    ],
  });

  // ---------- APPOINTMENTS ----------
  await db.appointment.createMany({
    data: [
      {
        subject: "Initial Consultation — Family Matter",
        clientId: client2.id,
        lawyerId: lawyer1.id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8),
        time: "11:00",
        duration: 60,
        type: "CONSULTATION",
        status: "SCHEDULED",
        notes: "Discuss khula proceedings and required documents.",
      },
      {
        subject: "Case Strategy Meeting",
        clientId: client3.id,
        lawyerId: lawyer2.id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4),
        time: "14:30",
        duration: 90,
        type: "HEARING_PREP",
        status: "SCHEDULED",
        notes: "Review financial records and prepare cross-examination.",
      },
      {
        subject: "Document Review Session",
        clientId: client1.id,
        lawyerId: lawyer3.id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
        time: "10:00",
        duration: 45,
        type: "DOCUMENT_REVIEW",
        status: "COMPLETED",
        notes: "Reviewed FIR and supporting evidence.",
      },
      {
        subject: "Follow-up — Banking Suit",
        clientId: client1.id,
        lawyerId: lawyer2.id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 11),
        time: "15:00",
        duration: 60,
        type: "FOLLOW_UP",
        status: "SCHEDULED",
        notes: "Discuss hearing strategy and witness list.",
      },
    ],
  });

  // ---------- INVOICES ----------
  await db.invoice.createMany({
    data: [
      {
        invoiceNumber: "INV-2024-001",
        clientId: client2.id,
        caseId: case1.id,
        amount: 75000,
        status: "PAID",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 12),
        description: "Professional fees — Khula petition drafting and filing",
        items: JSON.stringify([{ description: "Petition drafting & court filing", amount: 50000 }, { description: "Affidavit preparation", amount: 25000 }]),
      },
      {
        invoiceNumber: "INV-2024-002",
        clientId: client3.id,
        caseId: case2.id,
        amount: 350000,
        status: "PENDING",
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        description: "Retainer for SHC representation — shareholder dispute",
        items: JSON.stringify([{ description: "Retainer fee (SHC petition)", amount: 200000 }, { description: "Documentation & research", amount: 150000 }]),
      },
      {
        invoiceNumber: "INV-2024-003",
        clientId: client1.id,
        caseId: case3.id,
        amount: 120000,
        status: "PAID",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 25),
        paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 22),
        description: "Bail application — professional fees",
        items: JSON.stringify([{ description: "Bail application drafting", amount: 70000 }, { description: "Court representation (2 hearings)", amount: 50000 }]),
      },
      {
        invoiceNumber: "INV-2024-004",
        clientId: client1.id,
        caseId: case5.id,
        amount: 200000,
        status: "OVERDUE",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 30),
        description: "Banking court defense — written statement & hearings",
        items: JSON.stringify([{ description: "Written statement drafting", amount: 100000 }, { description: "Hearings (3 dates)", amount: 100000 }]),
      },
    ],
  });

  // ---------- DOCUMENTS ----------
  await db.document.createMany({
    data: [
      {
        title: "Khula Petition Draft",
        type: "PETITION",
        fileName: "khula_petition.pdf",
        fileSize: 248000,
        fileUrl: "/documents/khula_petition.pdf",
        description: "Final draft of khula petition filed in Family Court-III.",
        caseId: case1.id,
        uploadedBy: lawyer1.id,
      },
      {
        title: "Marriage Certificate (Nikah Nama)",
        type: "ID_PROOF",
        fileName: "nikah_nama.pdf",
        fileSize: 156000,
        fileUrl: "/documents/nikah_nama.pdf",
        description: " Certified copy of Nikah Nama.",
        caseId: case1.id,
        uploadedBy: lawyer1.id,
      },
      {
        title: "SHC Petition — Oppression & Mismanagement",
        type: "PETITION",
        fileName: "shc_petition.pdf",
        fileSize: 542000,
        fileUrl: "/documents/shc_petition.pdf",
        description: "Constitutional petition filed before Sindh High Court.",
        caseId: case2.id,
        uploadedBy: lawyer2.id,
      },
      {
        title: "Audited Financial Statements 2021-2023",
        type: "EVIDENCE",
        fileName: "financials_21_23.pdf",
        fileSize: 1240000,
        fileUrl: "/documents/financials.pdf",
        description: "Audited financial statements submitted by respondents.",
        caseId: case2.id,
        uploadedBy: lawyer2.id,
      },
      {
        title: "Bail Application & Court Order",
        type: "COURT_FILING",
        fileName: "bail_order.pdf",
        fileSize: 98000,
        fileUrl: "/documents/bail_order.pdf",
        description: "Certified copy of pre-arrest bail order.",
        caseId: case3.id,
        uploadedBy: lawyer3.id,
      },
      {
        title: "Sale Agreement — DHA Plot",
        type: "AGREEMENT",
        fileName: "sale_agreement.pdf",
        fileSize: 312000,
        fileUrl: "/documents/sale_agreement.pdf",
        description: "Original sale agreement dated 2019.",
        caseId: case4.id,
        uploadedBy: lawyer1.id,
      },
    ],
  });

  // ---------- REVIEWS ----------
  await db.review.createMany({
    data: [
      {
        name: "Ahmed Hassan",
        role: "Business Owner",
        content: "Shaheen Law Associates saved me from a false FIR. Their team was professional, responsive, and got my pre-arrest bail granted within days. Highly recommend their criminal defense practice.",
        rating: 5,
        lawyerId: lawyer3.id,
      },
      {
        name: "Sana Tariq",
        role: "Client",
        content: "Advocate Sarah Malik handled my khula case with utmost sensitivity and skill. She explained every step and fought for my rights. Forever grateful to the entire team.",
        rating: 5,
        lawyerId: lawyer1.id,
      },
      {
        name: "Usman Sheikh",
        role: "CEO, Sheikh Industries",
        content: "Their corporate team is exceptional. They handled our shareholder dispute at the Sindh High Court with strategic precision. Worth every rupee.",
        rating: 5,
        lawyerId: lawyer2.id,
      },
      {
        name: "Bilal Ahmed",
        role: "Property Investor",
        content: "Handled my property title dispute efficiently. Clear communication, fair fees, and a favorable outcome. Will return for all future legal needs.",
        rating: 5,
      },
      {
        name: "Ayesha Siddiqui",
        role: "Entrepreneur",
        content: "Drafted all our company incorporation documents and shareholder agreements. Professional and thorough. Made the SECP process painless.",
        rating: 5,
        lawyerId: lawyer2.id,
      },
    ],
  });

  // ---------- CONTACT MESSAGES ----------
  await db.contact.createMany({
    data: [
      {
        name: "Rizwan Ali",
        email: "rizwan@email.com",
        phone: "+92 321 9988776",
        subject: "Need consultation on property dispute",
        message: "I have a dispute with my brother over inherited property in Lahore. Need a consultation.",
        status: "NEW",
      },
      {
        name: "Maria Khan",
        email: "maria@email.com",
        phone: "+92 345 5566778",
        subject: "Divorce proceedings inquiry",
        message: "Looking to file for Khula. What documents would I need and what are the fees?",
        status: "READ",
      },
      {
        name: "Tariq Mehmood",
        email: "tariq@email.com",
        phone: "+92 333 4455667",
        subject: "Corporate tax matter",
        message: "Our company received a notice from FBR. Need representation before the tax tribunal.",
        status: "RESPONDED",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("Demo accounts:");
  console.log("  Admin:  admin@shaheenlaw.pk / admin123");
  console.log("  Lawyer: sarah@shaheenlaw.pk / lawyer123");
  console.log("  Client: ahmed.client@email.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
