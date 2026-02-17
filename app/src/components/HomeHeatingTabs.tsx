import {CardContent} from './ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import {HomeHeating} from './HomeHeating';
import {HomeHeatingCharts} from './HomeHeatingCharts';

export function HomeHeatingTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="heishamon-charts">Charts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <CardContent>
          <HomeHeating />
        </CardContent>
      </TabsContent>

      <TabsContent value="heishamon-charts">
        <CardContent>
          <HomeHeatingCharts />
        </CardContent>
      </TabsContent>
    </Tabs>
  );
}

export default HomeHeatingTabs;
