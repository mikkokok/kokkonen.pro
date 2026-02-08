import ElectricityConsumption from "./ElectricityConsumption"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import ElectricityPrices from "./ui/ElectricityPrices"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs"

export default function Electricity() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="prices">Prices</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <CardContent>
          <ElectricityConsumption />
        </CardContent>
      </TabsContent>
      <TabsContent value="prices">
        <CardContent>
          <ElectricityPrices />
        </CardContent>
      </TabsContent>
    </Tabs>
  )
}
