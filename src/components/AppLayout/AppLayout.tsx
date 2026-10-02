// 'use client';

import './AppLayout.css';

import { ReactNode } from "react";
import AppNavigation from "../AppNavigation/AppNavigation";
import { getSession } from '@/app/actions/users/session';
import { prisma } from '@/lib/prisma';

export default async function AppLayout({ children }: { children?: ReactNode }) {

    const session = await getSession();

    const currentUser = (session?.userId) ? await prisma.app_accounts.findUnique({
        where: {
            id: session?.userId
        },
        omit: {
            password_hash: true,
        }
    }) : undefined;

    // const [currentUrl, setCurrentUrl] = useState('/');

    return (
        <>
            {/* <AppNavigation currentUrl={currentUrl} setCurrentUrl={setCurrentUrl} /> */}
            <AppNavigation currentUrl={'/'} userData={currentUser || undefined} />
            <main className='app-layout-main'>{children}</main>
        </>
    );
}