import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Label,
} from "recharts";

import { CustomTooltip } from "./custom-tooltip.jsx";
import { CustomLegend } from "./custom-legend.jsx";

const centerLabel =
    (total) =>
    ({ viewBox }) => {
        const cx = viewBox?.cx ?? 0;
        const cy = viewBox?.cy ?? 0;
        return (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                <tspan x={cx} y={cy - 6} fontSize={10} fontWeight={600} fill="#71717a" letterSpacing="0.06em">
                    ВСЕГО
                </tspan>
                <tspan x={cx} y={cy + 16} fontSize={26} fontWeight={600} fill="#18181b">
                    {total}
                </tspan>
            </text>
        );
    };

export const CustomPieChart = ({
    data,
    colors,
    centerTotal = null,
    legendVariant = "default",
}) => {
    const sum = (data || []).reduce((s, x) => s + (Number(x.count) || 0), 0);
    const total =
        centerTotal !== null && centerTotal !== undefined ? Number(centerTotal) : sum;

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={108}
                        innerRadius={76}
                        paddingAngle={2}
                        stroke="none"
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                        <Label content={centerLabel(total)} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend variant={legendVariant} />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
