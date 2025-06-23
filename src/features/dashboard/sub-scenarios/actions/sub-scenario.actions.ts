"use server";

import { revalidatePath } from 'next/cache';
import { SubScenario } from '@/services/api';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export async function createSubScenarioAction(
  data: Omit<SubScenario, "id"> & { images?: any[] }
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const created = await httpClient.post('/sub-scenarios', data);

    // Handle image uploads if provided
    if (data.images?.length) {
      const fd = new FormData();
      data.images.forEach((img) => {
        fd.append("files", img.file);
        fd.append("isFeature", img.isFeature ? "true" : "false");
      });
      
      // Note: FormData uploads with fetch (includes cookies for auth)
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-scenarios/${created.id}/images`,
        { 
          method: "POST", 
          body: fd,
          credentials: 'include' // Include cookies for auth
        }
      );
    }

    // Revalidate the sub-scenarios page to show updated data
    revalidatePath('/dashboard/sub-scenarios');

    return {
      success: true,
      data: created,
    };
  } catch (error: any) {
    console.error('Error creating sub-scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al crear sub-escenario',
    };
  }
}

export async function updateSubScenarioAction(
  id: number,
  data: Partial<SubScenario>
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updated = await httpClient.put(`/sub-scenarios/${id}`, data);

    // Revalidate the sub-scenarios page to show updated data
    revalidatePath('/dashboard/sub-scenarios');

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error updating sub-scenario:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar sub-escenario',
    };
  }
}
