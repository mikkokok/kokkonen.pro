import ElectricityConsumption from "./ElectricityConsumption"
import {ElectricityDetails} from "./ElectricityDetails"
import {CardContent} from "../ui/card"
import ElectricityPrices from "./ElectricityPrices"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"

export default function Electricity() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="prices">Prices</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <CardContent>
          <ElectricityConsumption />
        </CardContent>
      </TabsContent>
      <TabsContent value="details">
        <CardContent>
          <ElectricityDetails />
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
