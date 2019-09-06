queue()
    .defer(d3.csv, "data/housing.csv")
    .await(makeGraphs);

function makeGraphs(error, housingData) {
    var ndx = crossfilter(housingData);

    housingData.forEach(function (d) {
        d['2018'] = +(d['2018']);
        d['2017'] = +(d['2017']);
        d['2016'] = +(d['2016']);
        d['2015'] = +(d['2015']);
        d['2014'] = +(d['2014']);
        d['2013'] = +(d['2013']);
        d['2012'] = +(d['2012']);
        d['2011'] = +(d['2011']);
        d['2010'] = +(d['2010']);

    })

    show_country_selector(ndx);
    show_rank_distribution(ndx);
    dc.renderAll();
}

function show_country_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('country'));
    var group = dim.group();

    dc.selectMenu("#discipline-selector")
        .dimension(dim)
        .group(group);
}


function show_rank_distribution(ndx) {

    function rankByGender(dimension, sex) {
        return dimension.group().reduce(
            function (p, v) {
                p.total++;
                if (v.sex == sex) {
                    p.match++;
                }
                return p;
            },
            function (p, v) {
                p.total--;
                if (v.sex == sex) {
                    p.match--;
                }
                return p;
            },
            function () {
                return {total: 0, match: 0};
            }
        );
    }

    var dim = ndx.dimension(dc.pluck("age"));
    var male = rankByGender(dim, "M");
    var female = rankByGender(dim, "F");

    dc.barChart("#rank-distribution")
        .width(400)
        .height(300)
        .dimension(dim)
        .group(male, "Male")
        .stack(female, "Female")
        .valueAccessor(function (d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            } else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({top: 10, right: 100, bottom: 30, left: 30});
}


