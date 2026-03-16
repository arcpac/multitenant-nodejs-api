import { CheckCircle, Mail01 } from "@untitledui/icons";
import { Button } from "react-aria-components";

export function UntitledUiSmokeTest() {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-6 w-6" />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                        Untitled UI test
                    </h2>
                    <p className="text-sm text-zinc-600">
                        If you can see the icon and button below, the install is working.
                    </p>
                </div>
            </div>

            <Button className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                <Mail01 className="h-5 w-5" />
                Test button
            </Button>
        </div>
    );
}