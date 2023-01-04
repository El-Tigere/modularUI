exports.main = (content, args) => `
<div>
    <p>test</p>
    <p>zweite Zeile</p>
    <app:test header="teeeeee st">
        <p>das hier ist ein Test!!!</p>
        <app:test header="noch ein Test">
            <p>hier ist jetzt Text</p>
        </app:test>
    </app:test>
</div>
`;

exports.test = (content, args) => `
<div>
    <h1>${args.header}</h1>
    ${content}
</div>
`