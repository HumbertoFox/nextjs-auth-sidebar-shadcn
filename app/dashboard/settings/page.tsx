import { getUser } from '@/_lib/dal';
import SettingsPageClient from './settings-client';

export default async function SettingsPage() {
    const user = await getUser();
    return (
        <SettingsPageClient user={user} />
    );
}