import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Village {
  village: string;
  taluko: string;
  district: string;
}

export interface UserData {
  userId: string;
  email: string;
  username: string;
  district: string;
  taluko: string;
  villageName: string;
  expiryDate: string;
  villages: Village[];
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const raw = snap.data();

  const rawVillages = raw.villages;
  const villages: Village[] = Array.isArray(rawVillages)
    ? rawVillages.map((v: any) => ({
        village: v.village ?? v.gamname ?? "",
        taluko: v.taluko ?? v.taluka ?? "",
        district: v.district ?? v.jillo ?? "",
      }))
    : [];

  return {
    userId: raw.userId ?? userId,
    email: raw.email ?? "",
    username: raw.username ?? "",
    district: raw.district ?? "",
    taluko: raw.taluko ?? raw.taluka ?? "",
    villageName: raw.villageName ?? raw.gamname ?? "",
    expiryDate: raw.expiryDate ?? raw.expiredOn ?? "",
    villages,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function setUserData(user: UserData) {
  const ref = doc(db, "users", user.userId);

  await setDoc(
    ref,
    {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserData(userId: string, data: Partial<UserData>) {
  const ref = doc(db, "users", userId);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function isAccessExpired(expiryDate: string): boolean {
  if (!expiryDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  return !isNaN(exp.getTime()) && exp < today;
}
