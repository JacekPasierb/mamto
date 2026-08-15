import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import mongoose from "mongoose";

import {parseCalendarDate, todayCalendarDate} from "@/lib/calculateCurrentStock";
import {enrichDocument} from "@/lib/documentHelpers";
import {DOCUMENT_FORM_TYPES, DOCUMENT_TYPES} from "@/lib/documentTypes";
import {connectDB} from "@/lib/mongodb";
import PersonalDocument from "@/models/PersonalDocument";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id} = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
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

    const document = await PersonalDocument.findOneAndUpdate(
      {_id: id, userId},
      {
        name: name.trim(),
        type: type || "identity",
        documentNumber: documentNumber?.trim() || "",
        issuer: issuer?.trim() || "",
        issuedAt: issuedAt ? parseCalendarDate(issuedAt) : null,
        expiresAt: parseCalendarDate(expiresAt),
        notes: notes?.trim() || "",
      },
      {new: true}
    );

    if (!document) {
      return NextResponse.json(
        {message: "Nie znaleziono dokumentu"},
        {status: 404}
      );
    }

    return NextResponse.json(
      enrichDocument(document.toObject(), todayCalendarDate())
    );
  } catch (error) {
    console.error("PUT documents error:", error);

    return NextResponse.json(
      {message: "Nie udało się zaktualizować dokumentu"},
      {status: 500}
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return NextResponse.json({message: "Brak autoryzacji"}, {status: 401});
    }

    const {id} = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({message: "Nieprawidłowe ID"}, {status: 400});
    }

    await connectDB();

    const document = await PersonalDocument.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!document) {
      return NextResponse.json(
        {message: "Nie znaleziono dokumentu"},
        {status: 404}
      );
    }

    return NextResponse.json({message: "Usunięto"});
  } catch (error) {
    console.error("DELETE documents error:", error);

    return NextResponse.json(
      {message: "Nie udało się usunąć dokumentu"},
      {status: 500}
    );
  }
}
