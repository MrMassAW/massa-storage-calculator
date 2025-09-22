document.addEventListener('DOMContentLoaded', () => {
    const numFilesInput = document.getElementById('numFiles');
    const totalSizeInput = document.getElementById('totalSize');
    const bytecodeSizeInput = document.getElementById('bytecodeSize');
    const resultDiv = document.getElementById('result');
    const examplesDropdown = document.getElementById('examplesDropdown'); // New dropdown element
    const calculateBtn = document.getElementById('calculateBtn');
    const breakdownContainer = document.getElementById('calculationBreakdown');

    // --- Event Listener for the Dropdown ---
    examplesDropdown.addEventListener('change', (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (!selectedOption.value) return; // Ignore the default disabled option

        const files = selectedOption.getAttribute('data-files');
        const sizeInMB = selectedOption.getAttribute('data-size');
        const bytecode = selectedOption.getAttribute('data-bytecode');
        
        fillAndCalculate(files, sizeInMB, bytecode);
    });

    calculateBtn.addEventListener('click', calculateCost);

    function fillAndCalculate(files, sizeInMB, bytecode) {
        numFilesInput.value = files;
        totalSizeInput.value = sizeInMB;
        bytecodeSizeInput.value = bytecode;
        calculateCost();
    }

    function calculateCost() {
        const BASE_COST_MAS = 0.001;
        const COST_PER_BYTE_MAS = 0.0001;
        const ENTRY_OVERHEAD_BYTES = 4;
        const AVG_KEY_SIZE_BYTES = 64;
        const masPriceUSD = 0.009;

        const numFiles = parseFloat(numFilesInput.value);
        const totalSizeMB = parseFloat(totalSizeInput.value);
        const bytecodeSizeKB = parseFloat(bytecodeSizeInput.value);

        if (isNaN(numFiles) || isNaN(totalSizeMB) || numFiles < 0 || totalSizeMB < 0) {
            resultDiv.innerHTML = `<p style="color: #ff4d4d;">Please enter valid numbers to see the results.</p>`;
            breakdownContainer.innerHTML = `
                <div class="step-placeholder">
                    <p>Enter values or select an example to see the step-by-step resolution here.</p>
                </div>`;
            return;
        }

        const totalSizeBytes = totalSizeMB * 1024 * 1024;
        const bytecodeSizeBytes = bytecodeSizeKB * 1024;
        
        const bytecodeCost = COST_PER_BYTE_MAS * bytecodeSizeBytes;
        const datastoreCost = COST_PER_BYTE_MAS * (((ENTRY_OVERHEAD_BYTES + AVG_KEY_SIZE_BYTES) * numFiles) + totalSizeBytes);
        
        const totalCostInMas = BASE_COST_MAS + bytecodeCost + datastoreCost;
        const totalCostInUSD = totalCostInMas * masPriceUSD;

        // --- Generate Breakdown HTML ---
        const breakdownHTML = `
            <div class="step">
                <h5>1. Formula with Your Values</h5>
                <p>Cost = <span class="value">${BASE_COST_MAS}</span> + (<span class="value">${COST_PER_BYTE_MAS}</span> * <span class="value">${bytecodeSizeBytes.toLocaleString()}</span>) + (<span class="value">${COST_PER_BYTE_MAS}</span> * (<span class="value">${numFiles.toLocaleString()}</span> * (<span class="value">${ENTRY_OVERHEAD_BYTES}</span> + <span class="value">${AVG_KEY_SIZE_BYTES}</span>) + <span class="value">${totalSizeBytes.toLocaleString()}</span>))</p>
            </div>
            <div class="step">
                <h5>2. Calculate Component Costs</h5>
                <p>Bytecode Cost = <span class="value">${bytecodeCost.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span> MAS</p>
                <p>Datastore Cost = <span class="value">${datastoreCost.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span> MAS</p>
            </div>
            <div class="step">
                <h5>3. Final Summation</h5>
                <p>Total = Base + Bytecode + Datastore</p>
                <p>Total = <span class="value">${BASE_COST_MAS}</span> + <span class="value">${bytecodeCost.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span> + <span class="value">${datastoreCost.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></p>
                <p class="final-cost"><strong>Total Cost = <span class="value">${totalCostInMas.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span> MAS</strong></p>
            </div>
        `;
        breakdownContainer.innerHTML = breakdownHTML;

        // --- Display Main Results ---
        resultDiv.innerHTML = `
            <div class="info-box">
                This is a <strong>one-time, upfront cost</strong> to rent storage on the ledger. There are no recurring fees.
            </div>
            <h4>Cost Breakdown</h4>
            <p><span>Base Cost:</span> <span>${BASE_COST_MAS.toFixed(4)} MAS</span></p>
            <p><span>Bytecode Cost (${bytecodeSizeKB} KB):</span> <span>${bytecodeCost.toLocaleString(undefined, {minimumFractionDigits: 4})} MAS</span></p>
            <p><span>Datastore Cost:</span> <span>${datastoreCost.toLocaleString(undefined, {minimumFractionDigits: 4})} MAS</span></p>
            <p class="total"><strong>Total Upfront Cost (MAS):</strong> <strong>${totalCostInMas.toLocaleString(undefined, {minimumFractionDigits: 4})}</strong></p>
            <p class="total"><strong>Total Upfront Cost (USD):</strong> <strong>$${totalCostInUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></p>

            <div class="refund-section">
                <h4>✅ Potential Refund on Deletion</h4>
                <p>When data is deleted, the <strong>Datastore Cost</strong> is returned to you.</p>
                <p class="highlight">
                    <strong>Refund Amount:</strong> 
                    <strong>${datastoreCost.toLocaleString(undefined, {minimumFractionDigits: 4})} MAS</strong>
                </p>
            </div>
        `;
    }
});