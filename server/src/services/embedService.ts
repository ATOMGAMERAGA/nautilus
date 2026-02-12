import ogs from 'open-graph-scraper';

export const embedService = {
  resolve: async (url: string) => {
    try {
      const { result } = await ogs({ url });
      if (!result.success) return null;

      return {
        url: result.requestUrl,
        title: result.ogTitle,
        description: result.ogDescription,
        site_name: result.ogSiteName,
        thumbnail_url: result.ogImage?.[0]?.url,
        type: result.ogType || 'link',
      };
    } catch (error) {
      return null;
    }
  }
};
