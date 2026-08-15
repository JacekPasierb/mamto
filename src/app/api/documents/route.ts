import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichDocument} from "@/lib/documentHelpers";
import {DOCUMENT_FORM_TYPES, DOCUMENT_TYPES} from "@/lib/documentTypes";
import {connectDB} from "@/lib/mongodb";
import PersonalDocument from "@/models/PersonalDocument";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    await connectDB();

    const documents = await PersonalDocument.find({userId})
      .sort({expiresAt: 1, name: 1})
      .lean();

    const now = todayCalendarDate();

    return NextResponse.json(
      documents.map((item) =>
        enrichDocument(item as Parameters<typeof enrichDocument>[0], now)
      ),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET documents error:", error);

    return NextResponse.json(
      {message: "Nie udało się pobrać dokumentów"},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const body = await request.json();
    const {name, type, documentNumber, issuer, issuedAt, expiresAt, notes} =
      body;

    if (!name?.trim()) {
      return NextResponse.json(
        {message: "Nazwa dokumentu jest wymagana"},
        {status: 400}
      );
    }

    if (!expiresAt) {
      return NextResponse.json(
        {message: "Data ważności jest wymagana"},
        {status: 400}
      );
    }

    if (
      type &&
      !DOCUMENT_FORM_TYPES.includes(
        type as (typeof DOCUMENT_FORM_TYPES)[number]
      ) &&
      !DOCUMENT_TYPES.includes(type as (typeof DOCUMENT_TYPES)[number])
    ) {
      return NextResponse.json(
        {message: "Nieprawidłowy typ dokumentu"},
        {status: 400}
      );
    }

    await connectDB();

    const document = await PersonalDocument.create({
      userId,
      name: name.trim(),
      type: type || "identity",
      documentNumber: documentNumber?.trim() || "",
      issuer: issuer?.trim() || "",
      issuedAt: issuedAt ? parseCalendarDate(issuedAt) : null,
      expiresAt: parseCalendarDate(expiresAt),
      notes: notes?.trim() || "",
    });

    return NextResponse.json(
      enrichDocument(document.toObject(), todayCalendarDate()),
      {status: 201}
    );
  } catch (error) {
    console.error("POST documents error:", error);

    return NextResponse.json(
      {message: "Nie udało się dodać dokumentu"},
      {status: 500}
    );
  }
}
