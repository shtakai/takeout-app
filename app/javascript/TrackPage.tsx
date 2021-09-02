import React from "react";
import dayjs from "dayjs";
import { useParams, useHistory } from "react-router-dom";

import { Box, AspectRatio, Container, Skeleton, Flex } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import Api from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { ChatProvider } from "./ChatProvider";
import { TrackView } from "./TrackView";

export const TrackPage: React.FC = () => {
  return (
    <ChatProvider>
      <TrackPageInner />
    </ChatProvider>
  );
};

export const TrackPageInner: React.FC = () => {
  const history = useHistory();
  const streamOptionState = Api.useTrackStreamOptions();
  const { slug: trackSlug } = useParams<{ slug: string }>();

  const { data: conferenceData, error: conferenceError, mutate: mutateConferenceData } = Api.useConference();

  React.useEffect(() => {
    if (!conferenceData) return;
    if (conferenceData.requested_at === 0) return; // Partially mutated by consumeIvsMetadata

    const now = dayjs();
    const isStale = conferenceData.stale_after && conferenceData.stale_after - 2 <= now.unix();
    console.log("conferenceData freshness", {
      isStale,
      now: now.toISOString(),
      at: dayjs.unix(conferenceData.requested_at).toISOString(),
      stale_after: dayjs.unix(conferenceData.stale_after).toISOString(),
    });

    if (isStale) {
      console.log("conferenceData is stale; request revalidation");
      mutateConferenceData();
      const interval = setInterval(() => {
        console.log("Revalidating stale conferenceData...");
        mutateConferenceData();
      }, 1000);
      return () => clearInterval(interval);
    } else {
      console.log("conferenceData is fresh!");
    }
  }, [conferenceData?.requested_at, conferenceData?.stale_after]);

  if (!conferenceData) {
    return (
      <>
        {conferenceError ? (
          <Box my={2}>
            <ErrorAlert error={conferenceError} />
          </Box>
        ) : null}
        <TrackPageSuspense />
      </>
    );
  }
  const conference = conferenceData?.conference;

  const trackIndex = conference.track_order.indexOf(trackSlug);
  const tracks = conference.track_order
    .filter((k) => conference.tracks.hasOwnProperty(k))
    .map((k) => conference.tracks[k]);
  const onTabChange = (index: number) => {
    const slug = conference.track_order[index];
    history.push(`/tracks/${slug}`);
  };

  return (
    <>
      <ChatProvider>
        <Tabs isLazy index={trackIndex} onChange={onTabChange}>
          <TabList>
            {tracks.map((t) => (
              <Tab key={t.slug}>{t.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {tracks.map((t) => {
              return (
                <TabPanel key={t.slug}>
                  <TrackView track={t} streamOptionsState={streamOptionState} />
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>
      </ChatProvider>
    </>
  );
};

const TrackPageSuspense: React.FC = () => {
  return (
    <>
      <Tabs>
        <TabList>
          <Tab>
            <Skeleton w="40px" h="12px" />
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Container maxW={["auto", "auto", "auto", "1700px"]}>
              <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]}>
                <Box w="100%">
                  <AspectRatio ratio={16 / 9}>
                    <Skeleton w="100%" h="100%" />
                  </AspectRatio>
                </Box>

                <Box maxW={["auto", "auto", "auto", "400px"]} minH="400px" w="100%" ml={3}></Box>
              </Flex>
            </Container>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default TrackPage;
