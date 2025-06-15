import { createScenariosContainer } from '@/features/dashboard/scenarios/di/ScenariosContainer.server';
import { ScenariosPage } from '@/features/dashboard/scenarios/components/ScenariosPage';

interface ScenariosPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    neighborhoodId?: string;
  };
}

export default async function ScenariosRoute(props: ScenariosPageProps) {
  const searchParams = await props.searchParams;
  
  // DDD: Dependency injection - build complete container
  const { scenariosService } = createScenariosContainer();

  try {
    // Parse search params with defaults
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 7,
      search: searchParams.search || "",
      neighborhoodId: searchParams.neighborhoodId ? parseInt(searchParams.neighborhoodId) : undefined,
    };

    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result = await scenariosService.getScenariosData(filters);

    // Atomic Design: Render page template with clean separation
    return <ScenariosPage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in ScenariosRoute:', error);

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in ScenariosRoute:', error);
    throw error;
  }
}
