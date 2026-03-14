import pool from '@/_lib/db';
import { User, UserRole } from '@/_types';

const ALLOWED_UPDATE_COLUMNS_USER: ReadonlySet<string> = new Set(['name', 'email', 'avatar']);
const ALLOWED_UPDATE_COLUMNS_ADMIN: ReadonlySet<string> = new Set(['name', 'email', 'role', 'password', 'avatar']);

function buildSetClause(data: Record<string, unknown>, allowed: ReadonlySet<string>): { setClause: string; values: unknown[] } {
    const keys = Object.keys(data).filter(k => allowed.has(k));
    if (!keys.length) throw new Error('No valid fields to update.');
    const values = keys.map(k => data[k]);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    return { setClause, values };
}

const USER_PUBLIC_COLUMNS = `
    id,
    name,
    email,
    role,
    avatar,
    email_verified,
    deleted_at,
    created_at,
    updated_at
`;

export const UserRepository = {
    async findPublicById(
        id: string
    ) {
        const result = await pool.query(`
            SELECT *
            FROM users_public
            WHERE id = $1
            LIMIT 1
        `,
            [
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async findActiveById(
        id: string
    ) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_active
            WHERE id = $1
            LIMIT 1
        `,
            [
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async findByEmailActive(
        email: string
    ) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_active
            WHERE email = $1
            LIMIT 1
        `,
            [
                email
            ]
        );
        return result.rows[0] ?? null;
    },

    async findByEmail(
        email: string
    ) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_public_active
            WHERE email = $1
            LIMIT 1
        `,
            [
                email
            ]
        );
        return result.rows[0] ?? null;
    },

    async adminExists(): Promise<boolean> {
        const result = await pool.query<{ exists: boolean }>(`
        SELECT EXISTS (
            SELECT 1
            FROM users_admin_public
            WHERE deleted_at IS NULL
        ) AS exists
    `);
        return result.rows[0].exists ?? false;
    },

    async findAdminOnly() {
        const result = await pool.query(`
            SELECT id
            FROM users_admin_public
            LIMIT 1
        `);
        return result.rows[0] ?? null;
    },

    async findAllAdmins() {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_admin_public
        `);
        return result.rows;
    },

    async countActiveAdmins(): Promise<number> {
        const result = await pool.query<{ count: string }>(`
        SELECT COUNT(*) 
        FROM users_admin_public
        WHERE deleted_at IS NULL
    `);

        return Number(result.rows[0].count);
    },

    async findById(
        id: string
    ) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_public
            WHERE id = $1
            LIMIT 1
        `,
            [
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async findUsersPaginated(
        page: number,
        pageSize: number
    ) {
        const offset = (page - 1) * pageSize;

        const usersResult = await pool.query<User>(`
            SELECT
                id,
                name,
                email,
                deleted_at
            FROM users_public
            WHERE role = 'USER'
            ORDER BY created_at
            LIMIT $1
            OFFSET $2
            `,
            [
                pageSize,
                offset
            ]
        );

        const countResult = await pool.query<{ count: string }>(`
            SELECT COUNT(*)
            FROM users_public
            WHERE role = 'USER'
        `);
        return [usersResult.rows, parseInt(countResult.rows[0].count, 10)] as const;
    },

    async create(
        data: {
            name: string;
            email: string;
            password: string;
            role: UserRole;
            avatar?: string | null;
        }
    ) {
        const result = await pool.query<User>(`
            INSERT INTO users (
                name,
                email,
                password,
                role,
                avatar
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            RETURNING ${USER_PUBLIC_COLUMNS}
        `,
            [
                data.name,
                data.email,
                data.password,
                data.role,
                data.avatar ?? null,
            ]
        );
        return result.rows[0];
    },

    async updateAvatar(
        id: string,
        avatar: string
    ) {
        await pool.query(`
            UPDATE users
            SET avatar = $1
            WHERE id = $2
        `,
            [
                avatar,
                id
            ]
        );
    },

    async updateByIdUserActive(
        id: string,
        data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>
    ) {
        if (!Object.keys(data).length) return null;
        const { setClause, values } = buildSetClause(data as Record<string, unknown>, ALLOWED_UPDATE_COLUMNS_USER);
        const result = await pool.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1
            AND deleted_at IS NULL
            RETURNING ${USER_PUBLIC_COLUMNS}
            `,
            [
                id,
                ...values
            ]
        );
        return result.rows[0] ?? null;
    },

    async updateByAdminUser(
        id: string,
        data: Partial<Pick<User, 'name' | 'email' | 'role' | 'password' | 'avatar'>>
    ) {
        const { setClause, values } = buildSetClause(data as Record<string, unknown>, ALLOWED_UPDATE_COLUMNS_ADMIN);

        const result = await pool.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1
            RETURNING ${USER_PUBLIC_COLUMNS}
            `,
            [
                id,
                ...values
            ]
        );
        return result.rows[0] ?? null;
    },

    async updatePassword(
        id: string,
        password: string
    ) {
        const result = await pool.query<User>(`
            UPDATE users
            SET password = $1
            WHERE id = $2
            RETURNING ${USER_PUBLIC_COLUMNS}
            `,
            [
                password,
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async softDeleteById(
        id: string
    ) {
        const result = await pool.query<User>(`
            UPDATE users
            SET deleted_at = NOW()
            WHERE id = $1
            RETURNING ${USER_PUBLIC_COLUMNS}
        `,
            [
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async reactivateById(
        id: string
    ) {
        const result = await pool.query<User>(`
            UPDATE users
            SET deleted_at = NULL
            WHERE id = $1
            RETURNING ${USER_PUBLIC_COLUMNS}
        `,
            [
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async updateEmailVerified(
        id: string,
        date: Date
    ) {
        const result = await pool.query<User>(`
            UPDATE users
            SET email_verified = $1
            WHERE id = $2
            RETURNING ${USER_PUBLIC_COLUMNS}
        `,
            [
                date,
                id
            ]
        );
        return result.rows[0] ?? null;
    },

    async updatePasswordByEmail(
        email: string,
        hashedPassword: string
    ) {
        const result = await pool.query(`
            UPDATE users
            SET password = $2
            WHERE email = $1
            RETURNING ${USER_PUBLIC_COLUMNS}
        `,
            [
                email,
                hashedPassword
            ]
        );
        return result.rows[0] ?? null;
    },
}