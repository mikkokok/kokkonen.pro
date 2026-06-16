import {CardContent} from './ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import {HomeHeating} from './HomeHeating';
import {HomeHeatingCharts} from './HomeHeatingCharts';
import {HomeHeatingTaskStatuses} from './HomeHeatingTaskStatuses';

export function HomeHeatingTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="task-statuses">Task statuses</TabsTrigger>
        <TabsTrigger value="heishamon-charts">Charts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <CardContent>
          <HomeHeating />
        </CardContent>
      </TabsContent>

      <TabsContent value="task-statuses">
        <CardContent>
          <HomeHeatingTaskStatuses />
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
