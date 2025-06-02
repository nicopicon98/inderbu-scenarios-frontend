import { InvalidFiltersError, SearchLimitExceededError } from '@/entities/sub-scenario/domain/sub-scenario.domain';
import { HomeDataResponse } from '@/features/home/data/application/GetHomeDataUseCase';
import { createHomeContainer } from '@/features/home/di';
import { HomePage } from '@/templates/home/ui';
import { redirect } from 'next/navigation';

interface HomePageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    activityAreaId?: string;
    neighborhoodId?: string;
    hasCost?: string;
  };
}

export default async function HomeRoute(props: HomePageProps) {
  const searchParams = await props.searchParams;
  
  // DDD: Dependency injection - build complete container
  const { homeService } = createHomeContainer();

  try {
    // DDD: Execute use case through service layer
    // All business logic, validation, and data fetching happens in domain/application layers
    const result: HomeDataResponse = await homeService.getHomeData(searchParams);

    console.log(`SSR: Home data loaded successfully with data ${result}`);
    console.log(`Results: ${result.subScenarios.data.length} scenarios, ${result.activityAreas.length} areas, ${result.neighborhoods.length} neighborhoods`);
    console.log(`Filters: ${result.appliedFilters.appliedFiltersList.join(', ') || 'None'}`);
    console.log(`Load time: ${result.metadata.loadTime}ms`);

    // Atomic Design: Render page template with clean separation
    return <HomePage initialData={result} />;

  } catch (error) {
    console.error('SSR Error in HomeRoute:', error);

    // DDD: Handle domain-specific errors with proper redirects
    if (error instanceof InvalidFiltersError) {
      console.warn('Invalid filters provided:', error.message);
      redirect('/?error=invalid-filters');
    }

    if (error instanceof SearchLimitExceededError) {
      console.warn('Search limit exceeded:', error.message);
      redirect('/?error=search-limit-exceeded');
    }

    // For unexpected errors, let Next.js error boundary handle it
    console.error('Unexpected error in HomeRoute:', error);
    throw error;
  }
}
