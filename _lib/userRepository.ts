import pool from '@/_lib/db';
import { UserRole } from '@/_types';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    password: string;
    avatar?: string | null;
    email_verified?: Date | null;
    deleted_at?: Date | null;
    created_at: Date;
    updated_at: Date;
    [key: string]: unknown;
}

export const UserRepository = {
    async findPublicById(id: string) {
        const result = await pool.query(`
            SELECT *
            FROM users_public
            WHERE id = $1
            LIMIT 1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async findActiveById(id: string) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_active
            WHERE id = $1
            LIMIT 1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async findByEmailActive(email: string) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_active
            WHERE email = $1
            LIMIT 1
            `,
            [email]
        );
        return result.rows[0] ?? null;
    },

    async findByEmail(email: string) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_public_active
            WHERE email = $1
            LIMIT 1
            `,
            [email]
        );
        return result.rows[0] ?? null;
    },

    async findFirstAdmin() {
        const result = await pool.query<User>(`
            SELECT *
            FROM users_admin_public
            LIMIT 1
        `);
        return result.rows[0] ?? null;
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

    async findById(id: string) {
        const result = await pool.query<User>(`
            SELECT *
            FROM users
            WHERE id = $1
            LIMIT 1
            `,
            [id]
    );
        return result.rows[0] ?? null;
    },

    async findUsersPaginated(page: number, pageSize: number) {
        const offset = (page - 1) * pageSize;

        const usersResult = await pool.query<User>(`
            SELECT
                id,
                name,
                email,
                deleted_at
            FROM users
            WHERE role = 'USER'
            ORDER BY created_at
            LIMIT $1
            OFFSET $2
            `,
            [pageSize, offset]
    );

        const countResult = await pool.query<{ count: string }>(`
            SELECT COUNT(*)
            FROM users
            WHERE role = 'USER'
        `);

        return [usersResult.rows, parseInt(countResult.rows[0].count, 10)] as const;
    },

    async create(data: {
        name: string;
        email: string;
        password: string;
        role: 'ADMIN' | 'USER';
        avatar?: string | null;
    }) {
        const result = await pool.query<User>(`
            INSERT INTO users (name, email, password, role, avatar)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
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

    async updateByIdUserActive(
        id: string,
        data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>
    ) {
        if (!Object.keys(data).length) return null;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
        const result = await pool.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `,
            [id, ...values]
        );
        return result.rows[0] ?? null;
    },

    async updateByAdminUser(
        id: string,
        data: Partial<Pick<User, 'name' | 'email' | 'role' | 'password' | 'avatar'>>
    ) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');

        const result = await pool.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1
            RETURNING *
            `,
            [id, ...values]
        );

        return result.rows[0] ?? null;
    },

    async updatePassword(id: string, password: string) {
        const result = await pool.query<User>(`
            UPDATE users
            SET password = $1
            WHERE id = $2
            RETURNING *
            `,
            [password, id]
        );

        return result.rows[0] ?? null;
    },

    async softDeleteById(id: string) {
        const result = await pool.query<User>(`
            UPDATE users
            SET deleted_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async reactivateById(id: string) {
        const result = await pool.query<User>(`
            UPDATE users
            SET deleted_at = NULL
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    async updateEmailVerified(id: string, date: Date) {
        const result = await pool.query<User>(`
            UPDATE users
            SET email_verified = $1
            WHERE id = $2
            RETURNING *
            `,
            [date, id]
        );

        return result.rows[0] ?? null;
    },

    async updatePasswordByEmail(email: string, hashedPassword: string) {
        const result = await pool.query(`
            UPDATE users
            SET password = $2
            WHERE email = $1
            RETURNING *
            `,
            [email, hashedPassword]
        );

        return result.rows[0] ?? null;
    },
}