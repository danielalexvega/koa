import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import {
  createElementSmartLink,
  createItemSmartLink,
} from "../utils/smartlink";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Deal from "../components/deal/Deal";
import { DealsType, LanguageCodenames } from "../model";

const DealDetail: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const queryClient = useQueryClient();

  const dealQuery = useQuery({
    queryKey: [`deal-detail_${slug}`, isPreview, lang],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);

      console.log("Looking for deal with slug:", slug);
      
      // Since DealsType doesn't have url_slug, we'll use the system codename
      const response = await client
        .items<DealsType>()
        .type("deals")
        .equalsFilter("system.codename", slug ?? "")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise()

      console.log("Deal query response:", response);
      console.log("Found deals:", response.data.items.length);
      
      return response.data.items[0] ?? null;


    }
  });




  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (dealQuery.data) {
      applyUpdateOnItemAndLoadLinkedItems(
        dealQuery.data,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items as DealsType[])
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData([`deals_${slug}`, isPreview, lang], updatedItem);
        }
      });
    }
  }, [dealQuery.data, environmentId, apiKey, isPreview, slug, lang, queryClient]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        dealQuery.refetch();
      }
    },
    [dealQuery],
  );

  useCustomRefresh(onRefresh);

  const deal = dealQuery.data;

  if (!deal) {
    return <div className="flex-grow" />;
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Deal Component */}
      <div 
        {...createItemSmartLink(deal.system.id)}
        {...createElementSmartLink("deal_title")}
      >
        <Deal
          dealTitle={deal.elements.deal_title?.value || ""}
          startDate={deal.elements.start?.value || ""}
          endDate={deal.elements.end?.value || ""}
          body={deal.elements.body?.value || ""}
          dealImage={deal.elements.deal_image?.value[0] ? {
            url: deal.elements.deal_image.value[0].url,
            alt: deal.elements.deal_image.value[0].description || deal.elements.deal_title?.value || ""
          } : undefined}
          showReserveButton={true}
        />
      </div>
    </div>
  );
};

export default DealDetail;
