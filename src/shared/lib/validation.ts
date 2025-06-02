import { z } from 'zod';

// Common validation schemas
export const IdSchema = z.number().int().positive();

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

export const SearchSchema = z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const DateSchema = z.string().datetime().or(z.date());

export const QueryParamsSchema = PaginationSchema.merge(SearchSchema);

// Validation utilities
export class ValidationError extends Error {
    constructor(
        message: string,
        public field: string,
        public code: string = 'VALIDATION_ERROR'
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const firstError = result.error.errors[0];
        throw new ValidationError(
            firstError.message,
            firstError.path.join('.'),
            firstError.code
        );
    }

    return result.data;
};

export const createFormDataValidator = <T>(schema: z.ZodSchema<T>) => {
    return (formData: FormData): T => {
        const data: Record<string, any> = {};

        for (const [key, value] of formData.entries()) {
            // Handle arrays (multiple values with same key)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return validateSchema(schema, data);
    };
};