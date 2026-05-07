import {CardContent} from "../ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {Wemos} from "./Wemos";

export default function Devices() {
  return (
    <Tabs defaultValue="wemos">
      <TabsList>
        <TabsTrigger value="wemos">Wemos</TabsTrigger>
      </TabsList>
      <TabsContent value="wemos">
        <CardContent>
          <Wemos />
        </CardContent>
      </TabsContent>
    </Tabs>
  );
}
